import { get, list, put } from "@vercel/blob";
import { isAdminEmail } from "@/lib/visitor-analytics";

const FEEDBACK_PREFIX = "feedback/submissions";

export type FeedbackCategory = "bug" | "feature" | "improvement" | "design" | "general";

export interface FeedbackSubmission {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  manualLocation?: string;
  pagePath?: string;
  referrer?: string;
  message: string;
  category: FeedbackCategory;
  rating?: number;
  allowContact: boolean;
  country?: string;
  region?: string;
  city?: string;
  ip?: string;
  browser?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
  os?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  userAgent?: string;
  provider?: string;
  signedIn: boolean;
}

export interface FeedbackSnapshot {
  configured: boolean;
  storageError?: string;
  submissions: FeedbackSubmission[];
  totalSubmissions: number;
  averageRating: number | null;
  contactableCount: number;
  signedInCount: number;
  topCategories: Array<{ label: string; count: number }>;
  topLocations: Array<{ label: string; count: number }>;
}

function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isFeedbackStorageConfigured() {
  return Boolean(getBlobToken());
}

function buildFeedbackPath(submission: FeedbackSubmission) {
  const date = new Date(submission.createdAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const timestamp = submission.createdAt.replace(/[:.]/g, "-");
  return `${FEEDBACK_PREFIX}/${year}/${month}/${day}/${timestamp}-${submission.id}.json`;
}

export async function writeFeedbackSubmission(submission: FeedbackSubmission) {
  console.log("[FEEDBACK_SUBMISSION]", JSON.stringify(submission));

  const token = getBlobToken();
  if (!token) return;

  try {
    await put(buildFeedbackPath(submission), JSON.stringify(submission), {
      access: "private",
      contentType: "application/json",
      token,
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    console.error("[FEEDBACK_STORAGE_ERROR]", error);
  }
}

async function readFeedbackSubmission(pathname: string) {
  const token = getBlobToken();
  if (!token) return null;

  try {
    const result = await get(pathname, {
      access: "private",
      token,
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as FeedbackSubmission;
  } catch (error) {
    console.error("[FEEDBACK_READ_ERROR]", { pathname, error });
    return null;
  }
}

function createEmptySnapshot(storageError?: string): FeedbackSnapshot {
  return {
    configured: isFeedbackStorageConfigured(),
    storageError,
    submissions: [],
    totalSubmissions: 0,
    averageRating: null,
    contactableCount: 0,
    signedInCount: 0,
    topCategories: [],
    topLocations: [],
  };
}

function takeTopEntries(source: Map<string, number>, limit = 6) {
  return [...source.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function formatFeedbackLocation(submission: FeedbackSubmission) {
  return submission.manualLocation
    || [submission.city, submission.region, submission.country].filter(Boolean).join(", ")
    || "Unknown";
}

export async function getFeedbackSubmissions(limit = 120) {
  const token = getBlobToken();
  if (!token) return [];

  try {
    const blobs = [];
    let cursor: string | undefined;

    while (blobs.length < limit) {
      const page = await list({
        token,
        prefix: `${FEEDBACK_PREFIX}/`,
        limit: Math.min(limit, 100),
        cursor,
      });

      blobs.push(...page.blobs);
      if (!page.hasMore || !page.cursor) break;
      cursor = page.cursor;
    }

    const recent = blobs
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(0, limit);

    const submissions = await Promise.all(recent.map((blob) => readFeedbackSubmission(blob.pathname)));
    return submissions.filter((submission): submission is FeedbackSubmission => Boolean(submission));
  } catch (error) {
    console.error("[FEEDBACK_LIST_ERROR]", error);
    return [];
  }
}

export async function getFeedbackSnapshot(limit = 120): Promise<FeedbackSnapshot> {
  try {
    const submissions = await getFeedbackSubmissions(limit);
    const topCategories = new Map<string, number>();
    const topLocations = new Map<string, number>();
    let ratingSum = 0;
    let ratingCount = 0;
    let contactableCount = 0;
    let signedInCount = 0;

    for (const submission of submissions) {
      topCategories.set(submission.category, (topCategories.get(submission.category) ?? 0) + 1);
      const location = formatFeedbackLocation(submission);
      topLocations.set(location, (topLocations.get(location) ?? 0) + 1);

      if (typeof submission.rating === "number") {
        ratingSum += submission.rating;
        ratingCount += 1;
      }
      if (submission.allowContact && (submission.email || submission.phone)) {
        contactableCount += 1;
      }
      if (submission.signedIn) {
        signedInCount += 1;
      }
    }

    return {
      configured: isFeedbackStorageConfigured(),
      submissions,
      totalSubmissions: submissions.length,
      averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null,
      contactableCount,
      signedInCount,
      topCategories: takeTopEntries(topCategories),
      topLocations: takeTopEntries(topLocations),
    };
  } catch (error) {
    console.error("[FEEDBACK_SNAPSHOT_ERROR]", error);
    return createEmptySnapshot("Feedback storage is temporarily unavailable.");
  }
}

export { isAdminEmail };
