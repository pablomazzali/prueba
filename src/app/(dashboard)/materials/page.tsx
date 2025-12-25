"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDataContext } from "@/lib/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { LoadingScreen } from "@/components/shared/loading-screen";

interface StudyMaterial {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function MaterialsPage() {
  const supabase = createClient();
  const { materials, setMaterials, subjects, setSubjects, invalidateDashboardStats } = useDataContext();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Data is prefetched in dashboard layout
  const fetchMaterials = async (force = false) => {
    // Only refetch when explicitly requested (after mutations)
    if (!force) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive",
      });
      return;
    }

    setMaterials(data || []);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF or DOCX file`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("study-materials")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("study-materials")
          .getPublicUrl(fileName);

        // Save metadata to database
        const { error: dbError } = await supabase
          .from("study_materials")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
          });

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    invalidateDashboardStats(); // Invalidate dashboard cache
    fetchMaterials(true); // Force refresh
  };

  const handleDelete = async (id: string, filePath: string) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("study-materials")
      .remove([filePath]);

    if (storageError) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id);

    if (dbError) {
      toast({
        title: "Error",
        description: "Failed to delete file record",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "File deleted successfully",
    });

    invalidateDashboardStats(); // Invalidate dashboard cache
    fetchMaterials(true); // Force refresh
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your study materials (PDFs, DOCX)
        </p>
      </div>

      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-all ${
          dragActive
            ? "border-purple-500 bg-purple-50"
            : "border-gray-300 hover:border-purple-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-purple-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {uploading ? "Uploading..." : "Drop files here or click to browse"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Supports PDF and DOCX files up to 10MB
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".pdf,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading}
          />
          <Button
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Files
          </Button>
        </CardContent>
      </Card>

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>No materials yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Upload your study materials to get started with AI-powered summaries, flashcards, and quizzes.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm truncate" title={material.file_name}>
                        {material.file_name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(material.uploaded_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    const { data, error } = await supabase.storage
                      .from("study-materials")
                      .createSignedUrl(material.file_path, 3600);

                    if (error || !data) {
                      toast({
                        title: "Error",
                        description: "Failed to generate file URL",
                        variant: "destructive",
                      });
                      return;
                    }

                    window.open(data.signedUrl, "_blank");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(material.id, material.file_path)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
