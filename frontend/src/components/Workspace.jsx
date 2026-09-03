import Editor from "@monaco-editor/react";
import {
  Copy,
  Download,
  Eraser,
  FileDown,
  Loader2,
  Play,
  Save,
  Sparkles,
  Wand2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { api, apiError } from "../services/api";
import { modes } from "./Sidebar";
import ResponsePanel from "./ResponsePanel";

const languages = ["Python", "JavaScript", "TypeScript", "Java", "C++", "C", "Go", "Rust", "PHP"];
const monacoLanguage = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  "C++": "cpp",
  C: "c",
  Go: "go",
  Rust: "rust",
  PHP: "php"
};

const samples = [
  {
    mode: "generate",
    language: "Java",
    instruction: "Create a Java program to find the second largest element in an array.",
    code: ""
  },
  {
    mode: "debug",
    language: "Python",
    instruction: "Find the bug and explain the fix.",
    code: "def average(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total / len(num)\n"
  },
  {
    mode: "explain",
    language: "JavaScript",
    instruction: "Explain this debounce function in simple language.",
    code: "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n"
  },
  {
    mode: "test",
    language: "Python",
    instruction: "Generate pytest cases for this function.",
    code: "def is_palindrome(text):\n    cleaned = ''.join(ch.lower() for ch in text if ch.isalnum())\n    return cleaned == cleaned[::-1]\n"
  }
];

function extensionFor(language) {
  const map = {
    Python: "py",
    JavaScript: "js",
    TypeScript: "ts",
    Java: "java",
    "C++": "cpp",
    C: "c",
    Go: "go",
    Rust: "rs",
    PHP: "php"
  };
  return map[language] || "txt";
}

export default function Workspace({
  mode,
  onModeChange,
  theme,
  conversation,
  seedSnippet,
  showToast
}) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("JavaScript");
  const [instruction, setInstruction] = useState("");
  const [code, setCode] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeMode = useMemo(() => modes.find((item) => item.id === mode) || modes[0], [mode]);
  const ActiveModeIcon = activeMode.icon;

  useEffect(() => {
    if (conversation) {
      const lastUser = [...(conversation.messages || [])].reverse().find((message) => message.role === "user");
      const lastAssistant = [...(conversation.messages || [])].reverse().find((message) => message.role === "assistant");
      const lastPayload = lastUser?.payload || {};

      setConversationId(conversation.id);
      setLanguage(lastPayload.language || "Python");
      setTargetLanguage(lastPayload.target_language || "JavaScript");
      setInstruction(lastPayload.instruction || "");
      setCode(lastPayload.code || "");
      setResponse(lastAssistant?.payload || null);
      return;
    }

    if (seedSnippet) {
      setConversationId(null);
      setLanguage(seedSnippet.language || "Python");
      setTargetLanguage("JavaScript");
      setInstruction(seedSnippet.notes || "");
      setCode(seedSnippet.code || "");
      setResponse(null);
      return;
    }

    setConversationId(null);
    setInstruction("");
    setCode("");
    setResponse(null);
  }, [conversation, seedSnippet]);

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text || "");
      showToast("Copied.");
    } catch {
      showToast("Clipboard permission is unavailable.", "error");
    }
  }

  function bestCode() {
    return response?.generated_code || response?.corrected_code || code;
  }

  function downloadCode() {
    const blob = new Blob([bestCode() || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `assistant-output.${extensionFor(language)}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveSnippet() {
    const snippetCode = bestCode();
    if (!snippetCode) {
      showToast("There is no code to save yet.", "error");
      return;
    }
    try {
      await api.post("/snippets", {
        title: instruction.slice(0, 72) || `${language} snippet`,
        language,
        code: snippetCode,
        notes: response?.explanation || response?.result || "",
        conversation_id: conversationId
      });
      showToast("Snippet saved.");
    } catch (error) {
      showToast(apiError(error, "Could not save snippet."), "error");
    }
  }

  function clearWorkspace() {
    setInstruction("");
    setCode("");
    setResponse(null);
    setConversationId(null);
    showToast("Workspace cleared.");
  }

  async function runAssistant() {
    if (!instruction.trim() && !code.trim()) {
      showToast("Add a request or code first.", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/ai/analyze", {
        mode,
        language,
        target_language: mode === "convert" ? targetLanguage : null,
        instruction,
        code,
        conversation_id: conversationId
      });
      setConversationId(data.conversation_id);
      setResponse(data.result);
      showToast("AI response ready.");
    } catch (error) {
      showToast(apiError(error, "Assistant request failed."), "error");
    } finally {
      setLoading(false);
    }
  }

  function applySample(sample) {
    onModeChange(sample.mode);
    setLanguage(sample.language);
    setInstruction(sample.instruction);
    setCode(sample.code);
    setResponse(null);
  }

  function formatCode() {
    const action = editorRef.current?.getAction("editor.action.formatDocument");
    if (action) action.run();
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <ActiveModeIcon size={17} />
            {activeMode.label}
          </p>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">AI coding workspace</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            title="Copy output code"
            onClick={() => copyText(bestCode())}
            className="toolbar-button"
          >
            <Copy size={16} />
            <span>Copy</span>
          </button>
          <button type="button" title="Download output code" onClick={downloadCode} className="toolbar-button">
            <Download size={16} />
            <span>Download</span>
          </button>
          <button type="button" title="Save snippet" onClick={saveSnippet} className="toolbar-button">
            <Save size={16} />
            <span>Save</span>
          </button>
          <button type="button" title="Clear workspace" onClick={clearWorkspace} className="toolbar-button">
            <Eraser size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {samples.map((sample) => (
          <button
            key={`${sample.mode}-${sample.language}`}
            type="button"
            onClick={() => applySample(sample)}
            className="shrink-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-left text-xs text-zinc-700 transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <span className="font-medium capitalize">{sample.mode}</span>
            <span className="ml-2 text-zinc-500">{sample.language}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 lg:grid-cols-[1fr_1fr_auto]">
              <label>
                <span className="mb-2 block text-xs font-semibold uppercase text-zinc-500">Language</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="form-control h-10"
                >
                  {languages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-semibold uppercase text-zinc-500">Target</span>
                <select
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value)}
                  disabled={mode !== "convert"}
                  className="form-control h-10 disabled:opacity-50"
                >
                  {languages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                title="Format code"
                onClick={formatCode}
                className="mt-6 flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <FileDown size={16} />
                Format
              </button>
            </div>
            <div className="h-[430px] min-h-[430px] overflow-hidden rounded-b-lg">
              <Editor
                language={monacoLanguage[language] || "plaintext"}
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  automaticLayout: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                  wordWrap: "on"
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <label>
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
                <Sparkles size={15} />
                Instruction
              </span>
              <textarea
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                rows={5}
                placeholder="Describe what you want the assistant to do."
                className="form-control min-h-32 resize-y p-3"
              />
            </label>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={runAssistant}
                disabled={loading}
                className="flex h-11 min-w-40 items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
                {loading ? "Working" : "Generate"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <ResponsePanel response={response} onCopy={copyText} />
        </section>
      </div>
    </section>
  );
}
