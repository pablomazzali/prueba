"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDataContext } from "@/lib/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingScreen } from "@/components/shared/loading-screen";

interface StudyMaterial {
  id: string;
  file_name: string;
  file_path: string;
}

interface Flashcard {
  question: string;
  answer: string;
  difficulty: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type DetailLevel = "brief" | "standard" | "detailed";

// Flashcard color schemes - different colors for each card
const flashcardColors = [
  { front: "from-purple-500 to-blue-500", back: "from-pink-500 to-rose-500" },
  { front: "from-cyan-500 to-blue-500", back: "from-orange-500 to-amber-500" },
  { front: "from-indigo-500 to-purple-500", back: "from-green-500 to-emerald-500" },
  { front: "from-fuchsia-500 to-pink-500", back: "from-teal-500 to-cyan-500" },
  { front: "from-violet-500 to-purple-500", back: "from-lime-500 to-green-500" },
  { front: "from-blue-500 to-indigo-500", back: "from-red-500 to-pink-500" },
  { front: "from-emerald-500 to-teal-500", back: "from-amber-500 to-yellow-500" },
  { front: "from-rose-500 to-pink-500", back: "from-sky-500 to-blue-500" },
];

export default function AIToolsPage() {
  const supabase = createClient();
  const { materials, invalidateDashboardStats, generatedContent, setGeneratedContent } = useDataContext();
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generationType, setGenerationType] = useState<"summary" | "flashcards" | "quiz" | null>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("standard");

  // Load saved detail level preference from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem("summaryDetailLevel") as DetailLevel;
    if (savedLevel && ["brief", "standard", "detailed"].includes(savedLevel)) {
      setDetailLevel(savedLevel);
    }
  }, []);

  // Save detail level preference to localStorage when changed
  const handleDetailLevelChange = (level: DetailLevel) => {
    setDetailLevel(level);
    localStorage.setItem("summaryDetailLevel", level);
  };

  // Loading messages for different generation types
  const loadingMessages = {
    summary: [
      "Analyzing your study material...",
      "Extracting key concepts...",
      "Identifying main ideas...",
      "Crafting concise summary...",
      "Polishing final content...",
    ],
    flashcards: [
      "Scanning study material...",
      "Identifying important concepts...",
      "Creating question-answer pairs...",
      "Assessing difficulty levels...",
      "Finalizing flashcards...",
    ],
    quiz: [
      "Analyzing study content...",
      "Generating quiz questions...",
      "Creating answer options...",
      "Writing explanations...",
      "Finalizing your quiz...",
    ],
  };

  // Cycle through loading messages while generating
  useEffect(() => {
    if (!generating || !generationType) {
      setLoadingMessage("");
      return;
    }

    const messages = loadingMessages[generationType];
    let currentIndex = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [generating, generationType]);

  const extractAndGenerate = async (endpoint: string, setter: (data: any) => void, contentType: string) => {
    if (!selectedMaterial) {
      toast({
        title: "No material selected",
        description: "Please select a study material first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Extract text from the file
      const extractResponse = await fetch("/api/ai/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: selectedMaterial.file_path }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from file");
      }

      const { text } = await extractResponse.json();

      // Generate content
      const generateResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await generateResponse.json();

      // Update the generated content in context (this persists across navigation)
      setter(data);

      // Save generated content to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("generated_content").insert({
          user_id: user.id,
          material_id: selectedMaterial.id,
          content_type: contentType,
          content: data,
        });

        // Invalidate dashboard stats to trigger refetch
        invalidateDashboardStats();
      }

      toast({
        title: "Success!",
        description: "AI content generated and saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedMaterial) {
      toast({
        title: "No material selected",
        description: "Please select a study material first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGenerationType("summary");

    try {
      // Extract text from the file
      const extractResponse = await fetch("/api/ai/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: selectedMaterial.file_path }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from file");
      }

      const { text } = await extractResponse.json();

      // Generate content with detail level
      const generateResponse = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, detailLevel }),
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await generateResponse.json();

      // Update the generated content in context (this persists across navigation)
      setGeneratedContent({ ...generatedContent, summary: data.summary, summaryDetailLevel: detailLevel });

      // Save generated content to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("generated_content").insert({
          user_id: user.id,
          material_id: selectedMaterial.id,
          content_type: "summary",
          content: { summary: data.summary, detailLevel },
        });

        // Invalidate dashboard stats to trigger refetch
        invalidateDashboardStats();
      }

      toast({
        title: "Success!",
        description: "AI content generated and saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateFlashcards = () => {
    setGenerationType("flashcards");
    extractAndGenerate("/api/ai/flashcards", (data) => {
      setGeneratedContent({
        ...generatedContent,
        flashcards: data.flashcards,
        currentCardIndex: 0,
        flipped: false,
      });
    }, "flashcards");
  };

  const generateQuiz = () => {
    setGenerationType("quiz");
    extractAndGenerate("/api/ai/quiz", (data) => {
      setGeneratedContent({
        ...generatedContent,
        quiz: data.quiz,
        currentQuestionIndex: 0,
        selectedAnswers: new Array(data.quiz.length).fill(-1),
        showResults: false,
      });
    }, "quiz");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Study Tools
        </h1>
        <p className="text-gray-600 mt-1">
          Generate summaries, flashcards, and quizzes from your study materials
        </p>
      </div>

      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Study Material
          </CardTitle>
          <CardDescription>Choose a file to generate AI content from</CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-gray-500">
              No materials uploaded yet. Upload some files in the Materials page first.
            </p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => (
                <Button
                  key={material.id}
                  variant={selectedMaterial?.id === material.id ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{material.file_name}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Tools Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summaries</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quizzes</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>AI Summary Generator</CardTitle>
              <CardDescription>
                Get a concise summary of your study material
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Detail Level Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Summary Detail Level</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={detailLevel === "brief" ? "default" : "outline"}
                      onClick={() => handleDetailLevelChange("brief")}
                      disabled={generating}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="font-semibold text-sm">Brief</span>
                      <span className="text-xs opacity-75">Quick overview</span>
                    </Button>
                    <Button
                      type="button"
                      variant={detailLevel === "standard" ? "default" : "outline"}
                      onClick={() => handleDetailLevelChange("standard")}
                      disabled={generating}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="font-semibold text-sm">Standard</span>
                      <span className="text-xs opacity-75">Balanced depth</span>
                    </Button>
                    <Button
                      type="button"
                      variant={detailLevel === "detailed" ? "default" : "outline"}
                      onClick={() => handleDetailLevelChange("detailed")}
                      disabled={generating}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="font-semibold text-sm">Detailed</span>
                      <span className="text-xs opacity-75">In-depth analysis</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {detailLevel === "brief" && "~500-600 words - Perfect for quick review before exams"}
                    {detailLevel === "standard" && "~1,200-1,500 words - Covers core concepts with clear explanations"}
                    {detailLevel === "detailed" && "~2,500-3,000 words - Comprehensive with examples and connections"}
                  </p>
                </div>

                <Button
                  onClick={generateSummary}
                  disabled={!selectedMaterial || generating}
                  className="w-full"
                  size="lg"
                >
                  {generating && generationType === "summary" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">

                {generating && generationType === "summary" && loadingMessage && (
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">{loadingMessage}</span>
                  </div>
                )}
              </div>

              {generatedContent.summary && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-purple-900">Summary</h3>
                    {generatedContent.summaryDetailLevel && (
                      <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                        {generatedContent.summaryDetailLevel} Level
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {generatedContent.summary}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards">
          <Card>
            <CardHeader>
              <CardTitle>AI Flashcard Generator</CardTitle>
              <CardDescription>
                Create interactive flashcards for effective memorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={generateFlashcards}
                  disabled={!selectedMaterial || generating}
                  className="w-full"
                  size="lg"
                >
                  {generating && generationType === "flashcards" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Flashcards
                    </>
                  )}
                </Button>

                {generating && generationType === "flashcards" && loadingMessage && (
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">{loadingMessage}</span>
                  </div>
                )}
              </div>

              {generatedContent.flashcards.length > 0 && (
                <div className="space-y-4">
                  <div
                    className="relative h-64 cursor-pointer perspective-1000"
                    onClick={() => setGeneratedContent({ ...generatedContent, flipped: !generatedContent.flipped })}
                  >
                    <div
                      className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
                        generatedContent.flipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front of card */}
                      <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${flashcardColors[generatedContent.currentCardIndex % flashcardColors.length].front} rounded-lg p-8 flex flex-col items-center justify-center text-white shadow-xl`}>
                        <span className="text-xs font-semibold mb-4 px-3 py-1 bg-white/20 rounded-full">
                          Question
                        </span>
                        <p className="text-xl text-center font-medium">
                          {generatedContent.flashcards[generatedContent.currentCardIndex].question}
                        </p>
                        <p className="text-sm mt-6 opacity-75">Click to flip</p>
                      </div>
                      {/* Back of card */}
                      <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${flashcardColors[generatedContent.currentCardIndex % flashcardColors.length].back} rounded-lg p-8 flex flex-col items-center justify-center text-white shadow-xl rotate-y-180`}>
                        <span className="text-xs font-semibold mb-4 px-3 py-1 bg-white/20 rounded-full">
                          Answer
                        </span>
                        <p className="text-lg text-center">
                          {generatedContent.flashcards[generatedContent.currentCardIndex].answer}
                        </p>
                        <span className="mt-6 text-xs px-3 py-1 bg-white/20 rounded-full">
                          {generatedContent.flashcards[generatedContent.currentCardIndex].difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedContent({
                          ...generatedContent,
                          currentCardIndex: Math.max(0, generatedContent.currentCardIndex - 1),
                          flipped: false,
                        });
                      }}
                      disabled={generatedContent.currentCardIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      {generatedContent.currentCardIndex + 1} / {generatedContent.flashcards.length}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedContent({
                          ...generatedContent,
                          currentCardIndex: Math.min(generatedContent.flashcards.length - 1, generatedContent.currentCardIndex + 1),
                          flipped: false,
                        });
                      }}
                      disabled={generatedContent.currentCardIndex === generatedContent.flashcards.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>AI Quiz Generator</CardTitle>
              <CardDescription>
                Test your knowledge with AI-generated quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={generateQuiz}
                  disabled={!selectedMaterial || generating}
                  className="w-full"
                  size="lg"
                >
                  {generating && generationType === "quiz" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Quiz
                    </>
                  )}
                </Button>

                {generating && generationType === "quiz" && loadingMessage && (
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">{loadingMessage}</span>
                  </div>
                )}
              </div>

              {generatedContent.quiz.length > 0 && !generatedContent.showResults && (
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        Question {generatedContent.currentQuestionIndex + 1} of {generatedContent.quiz.length}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">
                      {generatedContent.quiz[generatedContent.currentQuestionIndex].question}
                    </h3>
                    <div className="space-y-2">
                      {generatedContent.quiz[generatedContent.currentQuestionIndex].options.map((option, index) => (
                        <Button
                          key={index}
                          variant={generatedContent.selectedAnswers[generatedContent.currentQuestionIndex] === index ? "default" : "outline"}
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const newAnswers = [...generatedContent.selectedAnswers];
                            newAnswers[generatedContent.currentQuestionIndex] = index;
                            setGeneratedContent({ ...generatedContent, selectedAnswers: newAnswers });
                          }}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {generatedContent.currentQuestionIndex < generatedContent.quiz.length - 1 ? (
                      <Button
                        onClick={() => setGeneratedContent({ ...generatedContent, currentQuestionIndex: generatedContent.currentQuestionIndex + 1 })}
                        className="ml-auto"
                      >
                        Next Question
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setGeneratedContent({ ...generatedContent, showResults: true })}
                        className="ml-auto"
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {generatedContent.showResults && (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h3 className="text-2xl font-bold text-center mb-2">
                      Your Score: {generatedContent.selectedAnswers.filter((ans, idx) => ans === generatedContent.quiz[idx].correctAnswer).length} / {generatedContent.quiz.length}
                    </h3>
                    <p className="text-center text-gray-600">
                      {Math.round((generatedContent.selectedAnswers.filter((ans, idx) => ans === generatedContent.quiz[idx].correctAnswer).length / generatedContent.quiz.length) * 100)}% Correct
                    </p>
                  </div>

                  {generatedContent.quiz.map((question, idx) => (
                    <Card key={idx} className={generatedContent.selectedAnswers[idx] === question.correctAnswer ? "border-green-500" : "border-red-500"}>
                      <CardHeader>
                        <CardTitle className="text-base">{question.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">
                          <strong>Your answer:</strong> {question.options[generatedContent.selectedAnswers[idx]]}
                        </p>
                        {generatedContent.selectedAnswers[idx] !== question.correctAnswer && (
                          <p className="text-sm text-green-600">
                            <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">{question.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setGeneratedContent({
                        ...generatedContent,
                        showResults: false,
                        currentQuestionIndex: 0,
                        selectedAnswers: new Array(generatedContent.quiz.length).fill(-1),
                      });
                    }}
                  >
                    Retry Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
