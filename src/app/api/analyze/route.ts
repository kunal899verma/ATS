import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ats-analyzer";
import { auth } from "@/auth";
import { trackAnalysis } from "@/lib/user-store";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1;
const MIN_RESUME_TEXT_LENGTH = 80;

function hasPdfSignature(buffer: Buffer) {
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

function getPdfParseErrorResponse(error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);

  console.error("[PDF Parse Error]", { name, message });

  if (name === "PasswordException") {
    return NextResponse.json(
      { error: "This PDF is password-protected. Please unlock it and upload it again, or paste the resume text directly." },
      { status: 422 }
    );
  }

  if (name === "InvalidPDFException" || name === "FormatError") {
    return NextResponse.json(
      { error: "This file does not appear to be a valid text-based PDF. Please export it again as a standard PDF, or paste the resume text directly." },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: "Failed to parse PDF. The file may be image-based or corrupted. Try copy-pasting your resume text instead." },
    { status: 422 }
  );
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
        return NextResponse.json(
          { error: "Uploaded file is empty. Please select a valid PDF, DOCX, or TXT resume file." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File is too large. Maximum size is 5MB." },
          { status: 413 }
        );
      }

      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        let parser;
        if (!hasPdfSignature(buffer)) {
          return NextResponse.json(
            { error: "The uploaded file is not a valid PDF. Please choose an actual PDF file or export your resume again." },
            { status: 422 }
          );
        }

        try {
          // pdf-parse v2 API: new PDFParse({ data: buffer }) + parser.getText()
          const { PDFParse } = await import("pdf-parse") as { PDFParse: new (opts: { data: Buffer }) => { getText(): Promise<{ text: string }>; destroy(): Promise<void> } };
          parser = new PDFParse({ data: buffer });
          const data = await parser.getText();
          resumeText = data.text;
        } catch (error) {
          return getPdfParseErrorResponse(error);
        } finally {
          try { await parser?.destroy(); } catch { /* ignore */ }
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
          return NextResponse.json(
            { error: "Failed to parse DOCX. Please try copy-pasting your resume text instead." },
            { status: 422 }
          );
        }
      } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        resumeText = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Please upload PDF, DOCX, or TXT — or paste your resume text directly." },
          { status: 415 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Please upload a resume file or paste your resume text." },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!resumeText || resumeText.trim().length < MIN_RESUME_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the file. If your resume is a scanned image, please copy-paste the text content directly.",
        },
        { status: 422 }
      );
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
          "X-Analysis-Version": "2.0",
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
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis. Please try again." },
      { status: 500 }
    );
  }
}
