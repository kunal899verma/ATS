import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ats-analyzer";
import { auth } from "@/auth";
import { trackAnalysis } from "@/lib/user-store";

export const runtime = "nodejs";
export const maxDuration = 30;

const ANALYSIS_VERSION = "2.1";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1;
const MIN_RESUME_TEXT_LENGTH = 80;

function json(status: number, body: unknown) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Analysis-Version": ANALYSIS_VERSION,
    },
  });
}

function hasPdfSignature(buffer: Buffer) {
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

function getPdfParseErrorResponse(error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  const stack = error instanceof Error ? (error.stack ?? "") : "";

  console.error("[PDF Parse Error]", { name, message: message.slice(0, 300), stack: stack.slice(0, 500) });

  // Password-protected
  if (name === "PasswordException" || message.includes("password") || message.includes("encrypted")) {
    return json(422, {
      error: "This PDF is password-protected. Please unlock it and upload it again, or paste the resume text directly.",
    });
  }

  // Invalid / corrupt PDF structure
  if (
    name === "InvalidPDFException" ||
    name === "FormatError" ||
    message.includes("invalid pdf") ||
    message.includes("not a pdf") ||
    message.includes("missing pdf") ||
    message.includes("unexpected end") ||
    message.includes("bad xref")
  ) {
    return json(422, {
      error: "This file does not appear to be a valid text-based PDF. Please export it again as a standard PDF, or paste the resume text directly.",
    });
  }

  // Module/import-level failure (canvas, worker, etc.) on serverless
  if (
    name === "TypeError" ||
    name === "ReferenceError" ||
    message.includes("cannot read") ||
    message.includes("is not a function") ||
    message.includes("is not a constructor") ||
    message.includes("worker") ||
    message.includes("canvas")
  ) {
    return json(422, {
      error: "PDF parsing is temporarily unavailable. Please paste your resume text directly using the 'Paste Text' option.",
    });
  }

  // Image-based or unreadable PDF
  return json(422, {
    error: "Failed to parse PDF. The file may be image-based or corrupted. Try copy-pasting your resume text instead.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const pastedText = formData.get("resumeText") as string | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    // Job description is optional — general analysis mode when not provided
    let resumeText = "";

    // Option A: pasted text
    if (pastedText && pastedText.trim().length >= MIN_RESUME_TEXT_LENGTH) {
      resumeText = pastedText.trim();
    }
    // Option B: uploaded file
    else if (file) {
      if (file.size < MIN_FILE_SIZE) {
        return json(400, {
          error:
            "Uploaded file is empty. Please select a valid PDF, DOCX, or TXT resume file.",
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return json(413, { error: "File is too large. Maximum size is 5MB." });
      }

      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        if (!hasPdfSignature(buffer)) {
          return json(422, {
            error:
              "The uploaded file is not a valid PDF (missing %PDF- header). Please choose an actual PDF file or export your resume again.",
          });
        }

        try {
          const { createRequire } = await import("module");
          const { pathToFileURL } = await import("url");
          const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
          const req = createRequire(import.meta.url);
          const workerPath = req.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
          pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

          const task = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), useSystemFonts: true });
          const doc = await task.promise;
          const textPages: string[] = [];
          for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
            const page = await doc.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items
              .filter((item: unknown) => typeof (item as { str?: string }).str === "string")
              .map((item: unknown) => (item as { str: string }).str)
              .join(" ");
            textPages.push(pageText);
          }
          resumeText = textPages.join("\n");
        } catch (error) {
          return getPdfParseErrorResponse(error);
        }
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          resumeText = result.value;
        } catch {
          return json(422, {
            error:
              "Failed to parse DOCX. Please try copy-pasting your resume text instead.",
          });
        }
      } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        resumeText = buffer.toString("utf-8");
      } else {
        return json(415, {
          error:
            "Unsupported file format. Please upload PDF, DOCX, or TXT — or paste your resume text directly.",
        });
      }
    } else {
      return json(400, { error: "Please upload a resume file or paste your resume text." });
    }

    // Validate extracted text
    if (!resumeText || resumeText.trim().length < MIN_RESUME_TEXT_LENGTH) {
      return json(422, {
        error:
          "Could not extract enough text from the file. If your resume is a scanned image, please copy-paste the text content directly.",
      });
    }

    // Sanitize: remove null bytes and excessive whitespace
    const cleanResume = resumeText
      .replace(/\0/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{4,}/g, "\n\n")
      .trim();

    const cleanJD = jobDescription
      ? jobDescription.replace(/\0/g, "").trim()
      : "";

    // Run analysis
    const result = analyzeResume(cleanResume, cleanJD);

    // Track analysis for signed-in users
    const session = await auth();
    if (session?.user?.email) {
      await trackAnalysis({
        email: session.user.email,
        score: result.overallScore,
        grade: result.grade,
        detectedRole: result.detectedRole ?? "unknown",
        inputMode: pastedText ? "paste" : "file",
        analyzedAt: new Date().toISOString(),
      });
    }

    const response = NextResponse.json(
      { success: true, result, resumeText: cleanResume },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Analysis-Version": ANALYSIS_VERSION,
        },
      }
    );

    // Mark free check as used (30-day cookie, readable by client JS for gate check)
    response.cookies.set("ats_free_used", "1", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[ATS Analysis Error]", error);
    return json(500, {
      error: "An unexpected error occurred during analysis. Please try again.",
    });
  }
}
