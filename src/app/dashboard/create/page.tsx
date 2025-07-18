"use client"

import { useState, useRef } from "react";
import { Loader2, UploadCloud, CheckCircle2, Edit2, Save } from "lucide-react";

export default function CreateMemeTemplate() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setResult(null);
    setError(null);
    setTags([]);
    setDescription("");
    setSaveMsg(null);
    setStep(1);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const classifyImageUpload = async () => {
    if (!image) return;
    setUploading(true);
    setError(null);
    setResult(null);
    setTags([]);
    setDescription("");
    setSaveMsg(null);
    setStep(2);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await fetch("/api/classify-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Upload failed");
        setUploading(false);
        setStep(1);
        return;
      }
      const data = await res.json();
      setResult(data);
      setTags(data.tags || []);
      setDescription(data.description || "");
      setStep(3);
    } catch (err) {
      setError("Upload failed");
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!image || !tags.length || !description) {
      setSaveMsg("Image, tags, and description are required.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    setStep(4);
    try {
      // 1. Upload image to Supabase Storage
      const formData = new FormData();
      formData.append("image", image);
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setSaveMsg(err.error || "Image upload failed");
        setSaving(false);
        setStep(3);
        return;
      }
      const { imageUrl } = await uploadRes.json();
      // 2. Insert into meme_templates
      const insertRes = await fetch("/api/insert-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: image.name || "Uploaded Meme",
          imageUrl,
          description,
          tags,
        }),
      });
      if (!insertRes.ok) {
        const err = await insertRes.json();
        setSaveMsg(err.error || "Failed to save template");
        setSaving(false);
        setStep(3);
        return;
      }
      setSaveMsg("🎉 Template saved successfully!");
      setStep(4);
    } catch (err) {
      setSaveMsg("Failed to save template");
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-2 tracking-tight drop-shadow-lg">
          Create Meme Template
        </h1>
        <p className="text-center text-gray-500 mb-8">Add new meme templates with AI-powered classification</p>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-8">
          {[
            { label: "Upload", icon: <UploadCloud className="w-5 h-5" /> },
            { label: "Classify", icon: <Loader2 className="w-5 h-5" /> },
            { label: "Edit", icon: <Edit2 className="w-5 h-5" /> },
            { label: "Save", icon: <Save className="w-5 h-5" /> },
          ].map((stepObj, idx) => (
            <div key={stepObj.label} className="flex flex-col items-center flex-1">
              <div
                className={`rounded-full p-3 mb-1 border-2 transition-all duration-300 ${
                  step > idx
                    ? "bg-green-100 border-green-400"
                    : step === idx + 1
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                {step > idx ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : stepObj.icon}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step > idx
                    ? "text-green-600"
                    : step === idx + 1
                    ? "text-blue-700"
                    : "text-gray-400"
                }`}
              >
                {stepObj.label}
              </span>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        {step === 1 && (
          <div
            className="flex flex-col items-center border-2 border-dashed border-blue-300 rounded-xl p-8 bg-blue-50 hover:bg-blue-100 transition cursor-pointer mb-6"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <UploadCloud className="w-12 h-12 text-blue-400 mb-2" />
            <p className="text-blue-700 font-semibold mb-2">Drag & drop or click to upload a meme image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-4 rounded-lg shadow max-h-56 border border-blue-200"
              />
            )}
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition disabled:opacity-50"
              onClick={classifyImageUpload}
              disabled={!image || uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Classifying...</span>
              ) : (
                "Classify with AI"
              )}
            </button>
            {error && <div className="text-red-500 mt-4">{error}</div>}
          </div>
        )}

        {/* Edit Section */}
        {step === 3 && (
          <div className="bg-blue-50 rounded-xl p-6 shadow-inner mb-6 animate-fade-in">
            <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5" /> Edit Tags & Description
            </h2>
            <div className="mb-4">
              <label className="block font-medium mb-1 text-blue-800">Tags (comma separated):</label>
              <input
                type="text"
                className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={tags.join(", ")}
                onChange={e => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                placeholder="e.g. funny, reaction, drake"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1 text-blue-800">Description:</label>
              <textarea
                className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this meme template..."
                rows={3}
              />
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg shadow transition disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Saving...</span>
              ) : (
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save to Templates</span>
              )}
            </button>
            {saveMsg && <div className="mt-4 text-blue-700 font-semibold">{saveMsg}</div>}
          </div>
        )}

        {/* Success Section */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Template Saved!</h2>
            <p className="text-green-800 mb-4">Your meme template has been added successfully.</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition"
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
                setResult(null);
                setTags([]);
                setDescription("");
                setSaveMsg(null);
                setStep(1);
              }}
            >
              Add Another Meme Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 