import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters long" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant. Extract and list ONLY the main topics, chapters, or syllabus items from the provided study material. Ignore preface, author information, publishing details, etc. Format as a clean, comma-separated list of topics. Be concise and focus on the actual subject matter topics.",
        },
        {
          role: "user",
          content: `Extract the main topics/syllabus from this study material:\n\n${text}\n\nReturn ONLY a clean list of topics, separated by commas. Example: "Linear equations, Quadratic equations, Factorization, Simultaneous equations"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const syllabus = completion.choices[0].message.content || "";

    return NextResponse.json({ syllabus });
  } catch (error: any) {
    console.error("Syllabus extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract syllabus" },
      { status: 500 }
    );
  }
}
