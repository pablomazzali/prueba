import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";

type DetailLevel = "brief" | "standard" | "detailed";

export async function POST(request: Request) {
  try {
    const { text, detailLevel = "standard" } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters long" },
        { status: 400 }
      );
    }

    // Validate detail level
    if (!["brief", "standard", "detailed"].includes(detailLevel)) {
      return NextResponse.json(
        { error: "Invalid detail level. Must be 'brief', 'standard', or 'detailed'" },
        { status: 400 }
      );
    }

    // Configure settings based on detail level
    const levelConfig = {
      brief: {
        maxTokens: 750,
        temperature: 0.5,
        instruction: "Create a concise summary focusing on the most critical concepts and key takeaways. Keep it brief but informative - perfect for quick review.",
      },
      standard: {
        maxTokens: 2000,
        temperature: 0.7,
        instruction: "Create a comprehensive summary covering all core concepts with clear explanations. Include important definitions and how concepts relate to each other.",
      },
      detailed: {
        maxTokens: 4000,
        temperature: 0.7,
        instruction: "Create an in-depth, thorough summary that explores all concepts in detail. Include context, examples, connections between ideas, and deeper explanations that promote true understanding.",
      },
    };

    const config = levelConfig[detailLevel as DetailLevel];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert educational tutor helping students prepare for exams. Your summaries should EXPLAIN concepts clearly, not just list topics.

For each key concept you identify:
- Define it in simple, clear terms
- Explain WHY it matters and its significance
- Show HOW it connects to other concepts
- Provide context or examples where helpful

Structure your summary hierarchically: start with core concepts, then supporting details. Use clear headings, bullet points, and formatting to enhance readability.

Write as if teaching a student who needs to truly understand the material, not just memorize it. ${config.instruction}`,
        },
        {
          role: "user",
          content: `Please create a ${detailLevel} summary of the following study material:\n\n${text}`,
        },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const summary = completion.choices[0].message.content;

    return NextResponse.json({ summary, detailLevel });
  } catch (error: any) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
