import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

// Maps markdown elements to this project's existing typography conventions
// (see app/privacy/page.tsx, app/terms/page.tsx for the hand-styled
// equivalent) so guide content matches the rest of the site without pulling
// in the Tailwind typography plugin.
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h2 className="mt-10 text-2xl font-semibold text-neutral-900">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-8 text-lg font-semibold text-neutral-900">{children}</h3>,
        p: ({ children }) => <p className="mt-4 text-sm leading-relaxed text-neutral-700">{children}</p>,
        ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700">{children}</ul>,
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
        a: ({ href, children }) => {
          const isInternal = href?.startsWith("/");
          if (isInternal && href) {
            return (
              <Link href={href} className="text-blue-600 hover:underline">
                {children}
              </Link>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {children}
            </a>
          );
        },
        table: ({ children }) => (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-neutral-300 text-left">{children}</thead>,
        th: ({ children }) => <th className="px-3 py-2 font-semibold text-neutral-900">{children}</th>,
        td: ({ children }) => <td className="border-t border-neutral-200 px-3 py-2 text-neutral-700">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
