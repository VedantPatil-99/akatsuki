import { UploadSimpleIcon } from "@phosphor-icons/react";

interface KnowledgeDropzoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
}

export const KnowledgeDropzone = ({
  file,
  onFileSelect,
}: KnowledgeDropzoneProps) => {
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.[0]) return;
    onFileSelect(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    onFileSelect(e.target.files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("file-upload")?.click();
    }
  };

  return (
    <label
      htmlFor="file-upload"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Drag and drop file here or click to browse"
      className="group bg-muted/30 border-border hover:bg-muted/60 focus-visible:ring-ring relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf,.docx,.pptx"
        onChange={handleChange}
      />
      <UploadSimpleIcon
        size={32}
        className="text-muted-foreground group-hover:text-foreground mb-3 transition-colors"
      />
      <span className="text-foreground text-center text-sm font-medium">
        {file ? file.name : "Click or drag PDF, DOCX, PPTX"}
      </span>
      {!file && (
        <span className="text-muted-foreground mt-1 text-xs">
          Max file size 50MB
        </span>
      )}
    </label>
  );
};
