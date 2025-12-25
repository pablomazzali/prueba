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
            "You are a helpful study assistant. Create multiple-choice quiz questions from study materials. Return ONLY a JSON array. Each question should have: question, options (array of 4 strings), correctAnswer (index 0-3), and explanation. Create 10 questions.",
        },
        {
          role: "user",
          content: `Create a quiz from this material:\n\n${text}\n\nReturn only a JSON array in this exact format: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = completion.choices[0].message.content || "[]";

    // Try to parse JSON, handling potential markdown formatting
    let quiz;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      quiz = JSON.parse(cleanContent);
    } catch (parseError) {
      throw new Error("Failed to parse quiz from AI response");
    }

    if (!Array.isArray(quiz)) {
      throw new Error("Invalid quiz format");
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
