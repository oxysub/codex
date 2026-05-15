"use client";

import { useWorkspaceTheme } from "@/components/workspace-theme";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import type { UnprivilegedEditor } from "react-quill";

const ReactQuill = dynamic(
  async () => {
    await import("quill/dist/quill.snow.css");
    const { default: RQ } = await import("react-quill");
    return RQ;
  },
  {
    ssr: false,
    loading: () => (
      <div
        className="jr-jd-editor__loading h-[min(360px,50vh)] animate-pulse rounded-lg border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      />
    )
  }
);

const JR_QUILL_STYLES = `
.job-rubric-jd-editor {
  --jr-jd-editor-text: #cbd5e1;
  --jr-jd-editor-heading: #e2e8f0;
}
.opal-workspace-theme[data-theme="light"] .job-rubric-jd-editor {
  --jr-jd-editor-text: #475569;
  --jr-jd-editor-heading: #334155;
}
.job-rubric-jd-editor .ql-toolbar.ql-snow {
  border: none;
  border-bottom: 1px solid var(--border);
  background: var(--card);
  padding: 6px 8px;
}
.job-rubric-jd-editor .ql-container.ql-snow {
  border: none;
  font-family: inherit;
  font-size: 13px;
}
.job-rubric-jd-editor .ql-editor {
  min-height: 280px;
  max-height: min(50vh, 480px);
  overflow-y: auto;
  color: var(--jr-jd-editor-text);
  line-height: 1.5;
}
.job-rubric-jd-editor .ql-editor strong,
.job-rubric-jd-editor .ql-editor b {
  color: var(--jr-jd-editor-heading);
  font-weight: 600;
}
.job-rubric-jd-editor .ql-editor.ql-blank::before {
  color: var(--muted);
  font-style: normal;
}
.job-rubric-jd-editor .ql-snow .ql-stroke {
  stroke: var(--muted);
}
.job-rubric-jd-editor .ql-snow .ql-fill {
  fill: var(--muted);
}
.job-rubric-jd-editor .ql-snow .ql-picker {
  color: var(--muted);
}
.job-rubric-jd-editor .ql-snow button:hover .ql-stroke,
.job-rubric-jd-editor .ql-snow button.ql-active .ql-stroke {
  stroke: var(--cyan);
}
.job-rubric-jd-editor .ql-snow button:hover .ql-fill,
.job-rubric-jd-editor .ql-snow button.ql-active .ql-fill {
  fill: var(--cyan);
}
.job-rubric-jd-editor .ql-editor ul,
.job-rubric-jd-editor .ql-editor ol {
  padding-left: 1.5em;
}
.job-rubric-jd-editor .ql-editor li {
  margin-bottom: 4px;
}
/* Tailwind preflight sets list-style:none — restore markers for pasted/native lists */
.job-rubric-jd-editor .ql-editor ul > li:not([data-list]) {
  list-style-type: disc;
  list-style-position: outside;
}
.job-rubric-jd-editor .ql-editor ol > li:not([data-list]) {
  list-style-type: decimal;
  list-style-position: outside;
}
.job-rubric-jd-editor .ql-editor li[data-list=bullet] > .ql-ui::before {
  color: var(--jr-jd-editor-text);
}
`;

type JdRichTextEditorProps = {
  value: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  editorKey?: string;
};

export default function JdRichTextEditor({
  value,
  onChange,
  placeholder = "Paste or edit the job description...",
  editorKey = "default"
}: JdRichTextEditorProps) {
  const { theme } = useWorkspaceTheme();
  const isLight = theme === "light";

  const onQuillChange = useCallback(
    (html: string, _delta: unknown, _source: unknown, editor: UnprivilegedEditor) => {
      onChange(html, editor.getText().trim());
    },
    [onChange]
  );

  const quillModules = useMemo(
    () => ({
      toolbar: "#jr-jd-quill-toolbar"
    }),
    []
  );

  const quillFormats = useMemo(() => ["bold", "italic", "list"], []);

  return (
  <>
      <style>{JR_QUILL_STYLES}</style>
      <div
        className="job-rubric-jd-editor mt-2 overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div key={isLight ? "jr-quill-light" : "jr-quill-dark"} className="flex min-h-0 flex-col">
          <div
            id="jr-jd-quill-toolbar"
            className="flex flex-shrink-0 flex-row flex-wrap items-center gap-1 border-b px-2 py-1"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <span className="ql-formats">
              <button type="button" className="ql-bold" aria-label="Bold" />
              <button type="button" className="ql-italic" aria-label="Italic" />
            </span>
            <span className="ql-formats">
              <button type="button" className="ql-list" value="ordered" aria-label="Numbered list" />
              <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
            </span>
            <span className="ql-formats">
              <button type="button" className="ql-clean" aria-label="Clear formatting" />
            </span>
          </div>
          <ReactQuill
            key={editorKey}
            theme="snow"
            className="jr-jd-quill flex flex-col"
            value={value}
            onChange={onQuillChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
}
