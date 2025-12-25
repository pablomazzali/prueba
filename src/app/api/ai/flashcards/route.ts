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
            "You are a helpful study assistant. Create flashcards from study materials. Return ONLY a JSON array of flashcards. Each flashcard should have: question, answer, and difficulty (easy/medium/hard). Create 10-15 flashcards covering the main concepts.",
        },
        {
          role: "user",
          content: `Create flashcards from this material:\n\n${text}\n\nReturn only a JSON array in this exact format: [{"question": "...", "answer": "...", "difficulty": "easy|medium|hard"}]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content || "[]";

    // Try to parse JSON, handling potential markdown formatting
    let flashcards;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      flashcards = JSON.parse(cleanContent);
    } catch (parseError) {
      throw new Error("Failed to parse flashcards from AI response");
    }

    if (!Array.isArray(flashcards)) {
      throw new Error("Invalid flashcards format");
    }

    return NextResponse.json({ flashcards });
  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
