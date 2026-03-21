import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }

  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "No file provided. Send multipart/form-data with a 'file' field." },
        { status: 400 }
      );
    }
    const file = formData.get("file") as File;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — also accept empty type (some browsers don't set it)
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileName = file.name?.toLowerCase() || "";
    const isAllowedByExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc");

    if (!allowedTypes.includes(file.type) && !isAllowedByExtension) {
      return NextResponse.json(
        { error: `Unsupported file type "${file.type || "unknown"}". Upload PDF, DOCX, or TXT files.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // PDF files
    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const result = await pdfParse(buffer);
        const text = result.text || "";

        if (!text.trim()) {
          return NextResponse.json(
            { error: "Could not extract text from this PDF. It may be a scanned/image-only PDF. Try opening it, selecting all text (Cmd+A), and pasting it instead." },
            { status: 422 }
          );
        }
        return NextResponse.json({ text: text.trim(), pages: result.numpages || 1 });
      } catch (pdfErr: unknown) {
        const msg = pdfErr instanceof Error ? pdfErr.message : "Unknown error";
        if (msg.includes("Invalid PDF") || msg.includes("structure") || msg.includes("password")) {
          return NextResponse.json(
            { error: "This PDF is corrupted, password-protected, or in an unsupported format. Try opening it and copy-pasting the text instead." },
            { status: 422 }
          );
        }
        return NextResponse.json(
          { error: `Failed to parse PDF. Try pasting the contract text directly.` },
          { status: 500 }
        );
      }
    }

    // DOCX files
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value || "";
        if (!text.trim()) {
          return NextResponse.json(
            { error: "Could not extract text from this document. It may be empty or in an unsupported format." },
            { status: 422 }
          );
        }
        return NextResponse.json({ text, pages: 1 });
      } catch (docErr: unknown) {
        const msg = docErr instanceof Error ? docErr.message : "Unknown error";
        return NextResponse.json(
          { error: `Failed to parse DOCX: ${msg}. Try pasting the contract text directly.` },
          { status: 500 }
        );
      }
    }

    // Plain text
    const text = buffer.toString("utf-8");
    if (!text.trim()) {
      return NextResponse.json(
        { error: "The file appears to be empty." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text, pages: 1 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process file: ${msg}. Try pasting your contract text directly.` },
      { status: 500 }
    );
  }
}
