"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { FileText, Upload, X, Loader2, Plus } from "lucide-react";

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
];

export function AddSubjectModal({
  open,
  onClose,
  onSuccess,
}: AddSubjectModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get a random color for the subject
  const getRandomColor = () => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      toast({
        title: "Subject name required",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Study material required",
        description: "Please upload a PDF or DOCX file for this subject",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the subject
      const { data: subject, error: subjectError } = await supabase
        .from("subjects")
        .insert({
          user_id: user.id,
          name: subjectName.trim(),
          color: getRandomColor(),
        })
        .select()
        .single();

      if (subjectError) throw subjectError;

      // If file was selected, upload it
      if (selectedFile && subject) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("study-materials")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        // Create material record linked to the subject
        const { error: materialError } = await supabase
          .from("study_materials")
          .insert({
            user_id: user.id,
            subject_id: subject.id,
            file_name: selectedFile.name,
            file_path: fileName,
            file_type: selectedFile.type.includes("pdf") ? "pdf" : "docx",
          });

        if (materialError) throw materialError;
      }

      toast({
        title: "Success!",
        description: selectedFile
          ? "Subject created with material"
          : "Subject created successfully",
      });

      // Reset form
      setSubjectName("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating subject:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 w-full overflow-hidden">
          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="subject-name">
              Subject Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject-name"
              placeholder="e.g., Mathematics I, Physics"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              Study Material <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500">Upload PDF or DOCX (max 20MB)</p>

            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full box-border">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Choose file</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !subjectName.trim() || !selectedFile}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Subject
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
