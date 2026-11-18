import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import "./PdfDropzone.css";

export interface PdfDropzoneProps {
  /** Called with the selected PDF, or `null` when the user removes it. */
  onFileSelect: (file: File | null) => void;
  /** Maximum file size in megabytes. Defaults to 10. */
  maxSizeMB?: number;
  /** Disables all interaction. */
  disabled?: boolean;
  /** Extra class for the root element. */
  className?: string;
}

const PDF_MIME = "application/pdf";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPdf(file: File): boolean {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  // Some OS/browser combos report an empty MIME type, so fall back to the extension.
  return file.type === PDF_MIME || (file.type === "" && hasPdfExtension);
}

function validate(file: File, maxSizeMB: number): string | null {
  if (!isPdf(file)) return `"${file.name}" isn't a PDF. Please choose a .pdf file.`;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `"${file.name}" is ${formatBytes(file.size)}. The maximum size is ${maxSizeMB} MB.`;
  }
  return null;
}

export function PdfDropzone({
  onFileSelect,
  maxSizeMB = 10,
  disabled = false,
  className = "",
}: PdfDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0); // handles dragenter/dragleave firing on child elements
  const hintId = useId();
  const errorId = useId();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (files.length > 1) {
        setError("Please select one file at a time.");
        return;
      }
      const candidate = files[0];
      const validationError = validate(candidate, maxSizeMB);
      if (validationError) {
        // Keep any previously valid selection; just surface the error.
        setError(validationError);
        return;
      }
      setError(null);
      setFile(candidate);
      onFileSelect(candidate);
    },
    [maxSizeMB, onFileSelect],
  );

  const openBrowser = () => {
    if (!disabled) inputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file after removing it
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openBrowser();
    }
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // required to allow dropping
    e.dataTransfer.dropEffect = disabled ? "none" : "copy";
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const rootClass = [
    "pdz",
    isDragging && "pdz--dragging",
    error && "pdz--error",
    disabled && "pdz--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="pdz__input"
        onChange={onInputChange}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
      />

      {file ? (
        <div className="pdz__file">
          <div className="pdz__file-icon" aria-hidden="true">PDF</div>
          <div className="pdz__file-meta">
            <span className="pdz__file-name" title={file.name}>{file.name}</span>
            <span className="pdz__file-size">{formatBytes(file.size)}</span>
          </div>
          <div className="pdz__file-actions">
            <button type="button" className="pdz__btn" onClick={openBrowser} disabled={disabled}>
              Replace
            </button>
            <button
              type="button"
              className="pdz__btn pdz__btn--ghost"
              onClick={removeFile}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="pdz__zone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          onClick={openBrowser}
          onKeyDown={onKeyDown}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <svg className="pdz__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="pdz__title">
            {isDragging ? "Drop your PDF here" : (
              <>Drag & drop a PDF, or <span className="pdz__link">browse</span></>
            )}
          </p>
          <p className="pdz__hint" id={hintId}>One PDF file, up to {maxSizeMB} MB</p>
        </div>
      )}

      <p className="pdz__error" id={errorId} role="alert" aria-live="assertive">
        {error ?? ""}
      </p>
    </div>
  );
}

export default PdfDropzone;
