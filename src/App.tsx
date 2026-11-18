import { useState } from "react";
import { PdfDropzone, formatBytes } from "./PdfDropzone";

/**
 * Usage example: the parent receives the selected file via `onFileSelect`
 * and can hand it to an upload API whenever it's ready.
 */
export default function App() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!pdf) return;
    // Connect your upload API here, e.g.:
    // const body = new FormData();
    // body.append("file", pdf);
    // await fetch("/api/upload", { method: "POST", body });
    setStatus(`Ready to upload "${pdf.name}" (${formatBytes(pdf.size)})`);
  };

  return (
    <main className="demo">
      <h1>PDF Upload Component</h1>
      <p className="demo__sub">
        Drag a PDF in or click to browse. Try a non-PDF or a file over 10 MB to see validation.
      </p>

      <PdfDropzone
        maxSizeMB={10}
        onFileSelect={(file) => {
          setPdf(file);
          setStatus("");
        }}
      />

      <button className="demo__upload" onClick={handleUpload} disabled={!pdf}>
        Upload
      </button>
      {status && <p className="demo__status">{status}</p>}
    </main>
  );
}
