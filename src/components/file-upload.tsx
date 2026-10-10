"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type UploadedFile = { path: string; name: string; size: number; previewUrl: string | null };

const MAX_BYTES = 100 * 1024 * 1024; // matches the design-files bucket limit
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.tif,.tiff,.ai,.eps,.cdr";
const ALLOWED_EXT = new Set(ACCEPT.split(",").map((e) => e.slice(1)));

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  tif: "image/tiff",
  tiff: "image/tiff",
  ai: "application/postscript",
  eps: "application/postscript",
  cdr: "application/x-coreldraw",
};

function prettySize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      setError("Please upload a PDF, AI, EPS, CDR, PNG, JPG or TIFF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 100 MB. Try exporting a compressed PDF.");
      return;
    }

    setBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
    const path = `${userId}/${Date.now()}-${safeName}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("design-files").upload(path, file, {
      contentType: MIME_BY_EXT[ext] ?? "application/octet-stream",
      upsert: false,
    });
    setBusy(false);

    if (upErr) {
      setError(`Upload failed: ${upErr.message}`);
      return;
    }
    if (value) void supabase.storage.from("design-files").remove([value.path]);
    const previewUrl = file.type.startsWith("image/") && ext !== "tif" && ext !== "tiff"
      ? URL.createObjectURL(file)
      : null;
    onChange({ path, name: file.name, size: file.size, previewUrl });
  }

  async function removeFile() {
    if (!value) return;
    const supabase = createClient();
    await supabase.storage.from("design-files").remove([value.path]);
    onChange(null);
  }

  if (value) {
    return (
      <div className="card flex items-center gap-4 bg-mint-soft p-4 animate-pop-in">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-ink bg-paper">
          {value.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={value.previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <FileText className="size-7" strokeWidth={2.2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{value.name}</p>
          <p className="text-sm text-ink-soft">{prettySize(value.size)} · uploaded ✓</p>
        </div>
        <button type="button" onClick={removeFile} className="btn-ghost px-3" aria-label="Remove file">
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={`flex w-full cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-ink px-6 py-8 text-center transition-all ${
          dragging ? "scale-[1.02] bg-sun-soft" : "bg-paper hover:bg-sky-soft"
        }`}
      >
        {busy ? (
          <Loader2 className="size-10 animate-spin" />
        ) : (
          <UploadCloud className="size-10" strokeWidth={2} />
        )}
        <span className="font-display text-lg font-semibold">
          {busy ? "Uploading…" : "Drop your design here or click to browse"}
        </span>
        <span className="text-sm text-ink-soft">PDF, AI, EPS, CDR, PNG, JPG or TIFF · up to 100 MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f);
        }}
      />
      {error && <p className="mt-2 font-semibold text-danger">{error}</p>}
    </div>
  );
}
