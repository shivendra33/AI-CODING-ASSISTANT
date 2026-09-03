import { Copy, FileText } from "lucide-react";

function ListBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TextBlock({ title, value }) {
  if (!value) return null;
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">{value}</p>
    </section>
  );
}

function CodeBlock({ title, code, onCopy }) {
  if (!code) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          title="Copy code"
          onClick={() => onCopy(code)}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Copy size={16} />
        </button>
      </div>
      <pre className="max-h-96 overflow-auto bg-zinc-950 p-4 font-mono text-xs leading-5 text-zinc-100">
        <code>{code}</code>
      </pre>
    </section>
  );
}

export default function ResponsePanel({ response, onCopy }) {
  if (!response) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <FileText className="mx-auto mb-3 text-zinc-400" size={28} />
          <p className="text-sm font-medium">AI response will appear here.</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Try a sample prompt or submit your own code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TextBlock title="Result" value={response.result} />
      <TextBlock title="Explanation" value={response.explanation} />
      <CodeBlock title="Generated Code" code={response.generated_code} onCopy={onCopy} />
      <CodeBlock title="Corrected Code" code={response.corrected_code} onCopy={onCopy} />
      <ListBlock title="Issues Found" items={response.issues_found} />
      <ListBlock title="Suggested Improvements" items={response.suggested_improvements} />
      <section className="grid gap-3 sm:grid-cols-2">
        <TextBlock title="Time Complexity" value={response.time_complexity} />
        <TextBlock title="Space Complexity" value={response.space_complexity} />
      </section>
      <ListBlock title="Test Cases" items={response.test_cases} />
      <TextBlock title="Documentation" value={response.documentation} />
    </div>
  );
}

