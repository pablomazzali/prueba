import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import pdfParse from "pdf-parse";

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Download the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from("study-materials")
      .download(filePath);

    if (error || !data) {
      throw new Error("Failed to download file");
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    let text = "";

    if (filePath.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (filePath.endsWith(".docx")) {
      // For DOCX, we'll use mammoth
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error("Unsupported file type");
    }

    // Clean up the text
    text = text.replace(/\s+/g, " ").trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file" },
        { status: 400 }
      );
    }

    // Limit text to 50000 characters to avoid API limits
    if (text.length > 50000) {
      text = text.substring(0, 50000) + "...";
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Text extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract text" },
      { status: 500 }
    );
  }
}
