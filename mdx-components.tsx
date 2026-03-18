import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-4 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-white mt-9 mb-3 leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-white mt-7 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-slate-300 leading-relaxed mb-5 text-[15px]">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2 text-slate-300 mb-5 ml-4 text-[15px]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2 text-slate-300 mb-5 ml-4 list-decimal list-inside text-[15px]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start gap-2 leading-relaxed">
        <span className="text-cyan-400 flex-shrink-0 mt-1">›</span>
        <span>{children}</span>
      </li>
    ),
    code: ({ children }) => (
      <code className="bg-white/8 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto mb-5 text-sm">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyan-500/50 pl-5 italic text-slate-400 mb-5 my-4">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-white/10 my-8" />,
    strong: ({ children }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="text-left text-slate-400 font-semibold border-b border-white/10 px-3 py-2">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="text-slate-300 border-b border-white/5 px-3 py-2">{children}</td>
    ),
    ...components,
  };
}
