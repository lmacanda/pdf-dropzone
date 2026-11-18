# PdfDropzone

A reusable React component for selecting a single PDF by drag-and-drop or by clicking to browse. It has no dependencies beyond React.

## Features
- Accepts one PDF at a time, up to 10 MB by default (configurable)
- Shows the selected file's name and size, with **Replace** and **Remove** actions
- Clear inline errors for non-PDF files, oversized files and multiple files
- Passes the file to the parent through `onFileSelect`, ready for any upload API
- Accessible: keyboard operable (Enter/Space), errors announced to screen readers, visible focus and drag states
- Themed with CSS custom properties, so it's easy to restyle

## Usage

Copy `src/PdfDropzone.tsx` and `src/PdfDropzone.css` into your project.

```tsx
import { useState } from "react";
import { PdfDropzone } from "./PdfDropzone";

function UploadForm() {
  const [pdf, setPdf] = useState<File | null>(null);

  const upload = async () => {
    if (!pdf) return;
    const body = new FormData();
    body.append("file", pdf);
    await fetch("/api/upload", { method: "POST", body });
  };

  return (
    <>
      <PdfDropzone onFileSelect={setPdf} />
      <button onClick={upload} disabled={!pdf}>Upload</button>
    </>
  );
}
```

## Props

| Prop           | Type                           | Default | Description                                      |
| -------------- | ------------------------------ | ------- | ------------------------------------------------ |
| `onFileSelect` | `(file: File \| null) => void` | —       | Called with the valid PDF, or `null` on removal. |
| `maxSizeMB`    | `number`                       | `10`    | Maximum file size in MB.                         |
| `disabled`     | `boolean`                      | `false` | Disables all interaction.                        |
| `className`    | `string`                       | `""`    | Extra class on the root element.                 |

## Theming

Override the variables on `.pdz` (or on a class you pass in through `className`):

```css
.my-dropzone {
  --pdz-accent: #0f766e;
  --pdz-accent-soft: #f0fdfa;
  --pdz-radius: 8px;
}
```

## Behaviour notes
- If an invalid file is chosen while a valid one is already selected, the existing selection is kept and only the error is shown. The parent is not called.
- The file type is checked by MIME type, with a `.pdf` extension fallback for browsers that report an empty MIME type.

## Run the demo
```bash
npm install
npm run dev
```
