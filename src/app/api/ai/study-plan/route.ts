import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";

export async function POST(request: Request) {
  try {
    const { exams, studyHoursPerDay, startDate, additionalNotes, materialContent } = await request.json();

    if (!exams || exams.length === 0) {
      return NextResponse.json(
        { error: "At least one exam is required" },
        { status: 400 }
      );
    }

    // Sort exams by date for sequential focus
    const sortedExams = [...exams].sort((a, b) =>
      new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );

    // Calculate study period
    const start = new Date(startDate);
    const lastExamDate = new Date(sortedExams[sortedExams.length - 1].examDate);

    // End date is either 1 day before last exam, or the last exam day itself if exam is very soon
    const endDate = new Date(lastExamDate);
    const daysUntilExam = Math.ceil((lastExamDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Only subtract buffer days if we have enough time
    if (daysUntilExam > 2) {
      endDate.setDate(endDate.getDate() - 1);
    }

    // Calculate total days - minimum 1 day for same-day or next-day exams
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Build detailed exam list with syllabus if provided
    const examsList = sortedExams.map((exam: any, index: number) => {
      let examText = `${index + 1}. ${exam.subject} - ${exam.examName} on ${exam.examDate}`;
      if (exam.syllabus && exam.syllabus.trim()) {
        examText += `\n   Topics/Syllabus: ${exam.syllabus}`;
      }
      return examText;
    }).join("\n\n");

    // Build material content section if available
    let materialSection = "";
    if (materialContent && Object.keys(materialContent).length > 0) {
      materialSection = "\n\nSTUDY MATERIALS CONTENT (use these to create specific, topic-based tasks):\n";
      for (const [subject, materials] of Object.entries(materialContent)) {
        if (Array.isArray(materials) && materials.length > 0) {
          materialSection += `\n--- ${subject} Materials ---\n`;
          for (const mat of materials as { fileName: string; content: string }[]) {
            materialSection += `File: ${mat.fileName}\nContent Preview:\n${mat.content}\n\n`;
          }
        }
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert study planning assistant. Create detailed, realistic study plans with SPECIFIC and ACTIONABLE tasks. Use SEQUENTIAL FOCUS strategy: prioritize the nearest exam first, then shift focus to the next exam after it passes. Each task must include the exam it's for, a recommended study technique, AND a time estimate in minutes. Return ONLY a JSON object with this structure: {\"dailyPlan\": [{\"date\": \"2024-01-15\", \"day\": \"Monday\", \"tasks\": [{\"text\": \"Complete 10 problems on quadratic equations\", \"examName\": \"Algebra Mid\", \"subject\": \"Algebra\", \"technique\": \"Practice Problems\", \"timeEstimate\": 30}], \"hours\": 2}], \"tips\": [\"Tip 1\", \"Tip 2\"]}. Available techniques: Feynman Technique (explain concepts simply), Active Recall (test yourself), Spaced Repetition (review at intervals), Practice Problems (solve exercises), Pomodoro (25min focus blocks), Mind Mapping (visual connections), Summarizing (condense notes).",
        },
        {
          role: "user",
          content: `Create a personalized study plan for these exams using SEQUENTIAL FOCUS strategy:

${examsList}
${materialSection}

Study Period: ${startDate} to ${endDate.toISOString().split('T')[0]} (${totalDays} day${totalDays === 1 ? '' : 's'})
Available study hours per day: ${studyHoursPerDay}
${additionalNotes ? `\nStudent's Notes/Preferences: ${additionalNotes}` : ''}
${daysUntilExam <= 1 ? '\n⚠️ URGENT: Exam is TODAY or TOMORROW! Create an intensive last-minute review plan.' : ''}

SEQUENTIAL FOCUS STRATEGY:
- Focus heavily on exam #1 (nearest) until 1-2 days before it
- After exam #1, shift focus to exam #2
- Continue this pattern for all exams
- Increase study intensity as each exam approaches
- Assign appropriate study techniques based on the topic and task type
${daysUntilExam <= 1 ? '- For same-day/next-day exams: Focus on quick review, key concepts, and practice problems' : ''}

TASK REQUIREMENTS:
- Each task MUST include which exam it's for (examName and subject)
- Each task MUST include a study technique from: Feynman Technique, Active Recall, Spaced Repetition, Practice Problems, Pomodoro, Mind Mapping, Summarizing
- Each task MUST include a timeEstimate in minutes (e.g., 15, 30, 45, 60)
- Time estimates should sum to approximately ${studyHoursPerDay} hours (${studyHoursPerDay * 60} minutes) per day
- Be SPECIFIC and ACTIONABLE (e.g., "Solve 15 factorization problems" not just "Study algebra")
- Include measurable outcomes (numbers, specific topics)
- Distribute ${studyHoursPerDay} hours realistically per day (2-4 tasks)
- Ramp up intensity 3-4 days before each exam
${additionalNotes ? '- Consider the student\'s preferences and constraints mentioned above' : ''}
${materialSection ? '- IMPORTANT: Use the STUDY MATERIALS CONTENT above to create highly specific tasks based on actual topics, chapters, and concepts from the student\'s notes. Reference specific topics, formulas, theorems, or concepts mentioned in the materials.' : ''}

IMPORTANT: You MUST return a dailyPlan array with at least ${totalDays} day(s). Each day MUST have tasks.

Return ONLY the JSON object with the dailyPlan structure covering all ${totalDays} days.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content || "{}";

    // Parse JSON
    let plan;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      plan = JSON.parse(cleanContent);
    } catch (parseError) {
      throw new Error("Failed to parse study plan from AI response");
    }

    // Ensure dailyPlan exists and has content
    if (!plan.dailyPlan || plan.dailyPlan.length === 0) {
      // Create a fallback plan for today
      const today = new Date(startDate);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      plan.dailyPlan = [{
        date: startDate,
        day: dayNames[today.getDay()],
        hours: studyHoursPerDay,
        tasks: sortedExams.map((exam: any) => ({
          text: `Review key concepts and practice problems for ${exam.examName}`,
          examName: exam.examName,
          subject: exam.subject,
          technique: "Active Recall",
          timeEstimate: Math.round((studyHoursPerDay * 60) / sortedExams.length)
        }))
      }];
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Study plan generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate study plan" },
      { status: 500 }
    );
  }
}
