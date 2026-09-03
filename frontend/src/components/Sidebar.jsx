import {
  BookOpen,
  Bot,
  Bug,
  Code2,
  FileCode,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Repeat2,
  Save,
  TestTube,
  Wand2,
  X
} from "lucide-react";

export const modes = [
  { id: "generate", label: "AI Code Generator", icon: Wand2 },
  { id: "debug", label: "Debug Code", icon: Bug },
  { id: "explain", label: "Explain Code", icon: BookOpen },
  { id: "optimize", label: "Optimize Code", icon: Gauge },
  { id: "refactor", label: "Refactor Code", icon: Repeat2 },
  { id: "convert", label: "Convert Code", icon: FileCode },
  { id: "test", label: "Test Cases", icon: TestTube },
  { id: "document", label: "Documentation", icon: FileText },
  { id: "chat", label: "AI Chat", icon: MessageSquare }
];

export default function Sidebar({
  activeMode,
  activeView,
  onMode,
  onView,
  onNewChat,
  open,
  onClose
}) {
  const panelClass = open ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:relative md:z-auto ${panelClass}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-black">
              <Bot size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">AI Coding Assistant</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Code workspace</p>
            </div>
          </div>
          <button
            type="button"
            title="Close sidebar"
            onClick={onClose}
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <button
            type="button"
            onClick={onNewChat}
            className="mb-3 flex w-full items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
          >
            <Plus size={17} />
            New Chat
          </button>

          <button
            type="button"
            onClick={() => onView("dashboard")}
            className={`mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
              activeView === "dashboard"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase text-zinc-500">AI tools</p>
          <nav className="space-y-1">
            {modes.map((item) => {
              const Icon = item.icon;
              const active = activeView === "workspace" && activeMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onMode(item.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-800"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase text-zinc-500">Library</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onView("history")}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                activeView === "history"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <History size={17} />
              Chat History
            </button>
            <button
              type="button"
              onClick={() => onView("snippets")}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                activeView === "snippets"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <Save size={17} />
              Saved Snippets
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Code2 size={15} />
            Monaco + FastAPI
          </div>
        </div>
      </aside>
    </>
  );
}

