import Link from "next/link";

// Shared title bar for interior pages: H1 + breadcrumb trail.
export function PageHeader({
  title,
  breadcrumbs,
}: {
  title: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="bg-white border-b border-border">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-10 md:py-14">
        <h1 className="text-brand text-3xl md:text-4xl font-bold mb-3">
          {title}
        </h1>
        <nav aria-label="Breadcrumb" className="text-sm text-foreground/70">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-1">
                {b.href ? (
                  <Link href={b.href} className="hover:text-brand">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-brand font-medium">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <span className="text-foreground/40">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
