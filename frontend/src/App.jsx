import { LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import HistoryPanel from "./components/HistoryPanel";
import SavedSnippets from "./components/SavedSnippets";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import Workspace from "./components/Workspace";
import { api } from "./services/api";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("ai_coding_assistant_theme") || "dark");
  const [token, setToken] = useState(localStorage.getItem("ai_coding_assistant_token") || "");
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [activeMode, setActiveMode] = useState("generate");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const [activeConversation, setActiveConversation] = useState(null);
  const [seedSnippet, setSeedSnippet] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ai_coding_assistant_theme", theme);
  }, [theme]);

  useEffect(() => {
    async function loadUser() {
      if (!token) return;
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("ai_coding_assistant_token");
        setToken("");
      }
    }
    loadUser();
  }, [token]);

  function handleAuth(data) {
    localStorage.setItem("ai_coding_assistant_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setActiveView("dashboard");
  }

  function logout() {
    localStorage.removeItem("ai_coding_assistant_token");
    setToken("");
    setUser(null);
    setActiveConversation(null);
    setSeedSnippet(null);
  }

  function openWorkspaceWithMode(mode) {
    setActiveMode(mode);
    setActiveView("workspace");
    setSidebarOpen(false);
  }

  function startNewChat() {
    setActiveConversation(null);
    setSeedSnippet(null);
    setWorkspaceKey((value) => value + 1);
    setActiveView("workspace");
    setSidebarOpen(false);
  }

  function openConversation(conversation) {
    setActiveConversation(conversation);
    setSeedSnippet(null);
    setActiveMode(conversation.mode || "chat");
    setWorkspaceKey((value) => value + 1);
    setActiveView("workspace");
    setSidebarOpen(false);
  }

  function openSnippet(snippet) {
    setSeedSnippet(snippet);
    setActiveConversation(null);
    setActiveMode("optimize");
    setWorkspaceKey((value) => value + 1);
    setActiveView("workspace");
    setSidebarOpen(false);
  }

  if (!token || !user) {
    return (
      <>
        <AuthScreen
          onAuth={handleAuth}
          showToast={showToast}
          theme={theme}
          onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar
          activeMode={activeMode}
          activeView={activeView}
          onMode={openWorkspaceWithMode}
          onView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          onNewChat={startNewChat}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                title="Open sidebar"
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex">
                <User size={15} />
                Protected dashboard
              </span>
              <button
                type="button"
                title="Toggle theme"
                onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
                className="icon-button"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button type="button" title="Logout" onClick={logout} className="icon-button">
                <LogOut size={17} />
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-[1720px] px-4 py-5 lg:px-6">
            {activeView === "dashboard" && (
              <Dashboard
                onQuickAction={openWorkspaceWithMode}
                onOpenConversation={openConversation}
                showToast={showToast}
              />
            )}
            {activeView === "workspace" && (
              <Workspace
                key={workspaceKey}
                mode={activeMode}
                onModeChange={setActiveMode}
                theme={theme}
                conversation={activeConversation}
                seedSnippet={seedSnippet}
                showToast={showToast}
              />
            )}
            {activeView === "history" && (
              <HistoryPanel onOpenConversation={openConversation} showToast={showToast} />
            )}
            {activeView === "snippets" && (
              <SavedSnippets onOpenSnippet={openSnippet} showToast={showToast} />
            )}
          </main>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

