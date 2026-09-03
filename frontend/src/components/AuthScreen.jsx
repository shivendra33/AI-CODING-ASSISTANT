import { Bot, Loader2, Lock, Mail, Moon, Sun, User } from "lucide-react";
import { useState } from "react";

import { api, apiError } from "../services/api";

export default function AuthScreen({ onAuth, showToast, theme, onToggleTheme }) {
  const [isRegister, setIsRegister] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "Demo Developer",
    email: "demo@example.com",
    password: "password123"
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      onAuth(data);
      showToast(isRegister ? "Account created." : "Welcome back.");
    } catch (error) {
      showToast(apiError(error, "Authentication failed."), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex min-h-[42vh] flex-col justify-between bg-zinc-950 px-6 py-7 text-white dark:bg-black lg:min-h-screen lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-black">
                <Bot size={22} />
              </span>
              <div>
                <p className="text-lg font-semibold">AI Coding Assistant</p>
                <p className="text-xs text-zinc-400">Developer workspace</p>
              </div>
            </div>
            <button
              type="button"
              title="Toggle theme"
              onClick={onToggleTheme}
              className="rounded-md border border-zinc-800 p-2 text-zinc-300 hover:bg-zinc-900"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          <div className="max-w-2xl py-10">
            <p className="mb-3 text-sm font-medium text-emerald-300">Final-year ready coding platform</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Generate, explain, debug, refactor, and save code in one focused workspace.
            </h1>
            <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="font-medium text-white">Secure API</p>
                <p className="mt-2 text-zinc-400">Keys stay on the FastAPI backend.</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="font-medium text-white">Monaco editor</p>
                <p className="mt-2 text-zinc-400">Line numbers, themes, and formatting.</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="font-medium text-white">Saved history</p>
                <p className="mt-2 text-zinc-400">Sessions and snippets persist per user.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500">React, Vite, Tailwind, Monaco, FastAPI, SQLAlchemy</p>
        </section>

        <section className="flex items-center justify-center px-5 py-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-panel dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-6">
              <p className="text-2xl font-semibold">{isRegister ? "Create account" : "Sign in"}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {isRegister ? "Start a protected coding dashboard." : "Open your saved sessions."}
              </p>
            </div>

            {isRegister && (
              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-medium">Name</span>
                <span className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <User size={17} className="text-zinc-500" />
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="h-11 w-full bg-transparent text-sm outline-none"
                    required
                  />
                </span>
              </label>
            )}

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <span className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-950">
                <Mail size={17} className="text-zinc-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="h-11 w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <span className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-950">
                <Lock size={17} className="text-zinc-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="h-11 w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={17} className="animate-spin" />}
              {isRegister ? "Register" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="mt-4 w-full rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isRegister ? "Already have an account? Login" : "Need an account? Register"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

