// A language with its dot, the way GitHub marks a repository's language.
//
// The colours are GitHub's own (linguist's languages.yml), so a reader who lives on
// GitHub recognises TypeScript blue or Python's two-tone before reading the word.
// Anything not in the table gets the neutral grey linguist uses for unknowns.

const COLOURS: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f1e05a",
  python: "#3572A5",
  c: "#555555",
  "c++": "#f34b7d",
  go: "#00ADD8",
  rust: "#dea584",
  java: "#b07219",
  ruby: "#701516",
  html: "#e34c26",
  css: "#663399",
  shell: "#89e051",
  "next.js": "#ededed",
  tailwind: "#38bdf8",
  node: "#5fa04e",
  playwright: "#2EAD33",
  vitest: "#6E9F18",
  docker: "#2496ED",
};

export function langColour(name: string): string {
  return COLOURS[name.trim().toLowerCase()] ?? "#8b949e";
}

export default function LangDot({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-white/10"
        style={{ background: langColour(name) }}
      />
      {name}
    </span>
  );
}
