import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="text-4xl font-bold tracking-tight mt-0 mb-4" {...props} />
  ),
  h2: (props) => (
    <h2
      className="text-2xl font-bold tracking-tight mt-10 mb-3 scroll-mt-20"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-xl font-semibold tracking-tight mt-8 mb-2 scroll-mt-20"
      {...props}
    />
  ),
  p: (props) => (
    <p className="leading-7 mt-5 [&:not(:first-child)]:mt-5" {...props} />
  ),
  a: ({ href, ...props }) => {
    if (href?.startsWith("/")) {
      return (
        <Link
          href={href}
          className="text-primary underline underline-offset-2 hover:decoration-2"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:decoration-2"
        {...props}
      />
    );
  },
  ul: (props) => <ul className="my-4 list-disc pl-6 space-y-1" {...props} />,
  ol: (props) => (
    <ol className="my-4 list-decimal pl-6 space-y-1" {...props} />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-3 border-primary pl-4 italic text-muted-foreground my-6"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-card border border-border rounded-lg p-4 overflow-x-auto my-6 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-8" />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rounded-lg my-6" alt="" {...props} />
  ),
};
