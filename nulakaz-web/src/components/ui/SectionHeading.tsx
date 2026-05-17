// Section heading with a small underline accent, matching the original site's
// tab/section title treatment (e.g. "Popular", "Big Sales Today", "Our Blog").
export function SectionHeading({
  children,
  align = "center",
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
}) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  return (
    <Tag
      className={`text-brand text-[28px] md:text-[33px] font-bold ${alignClass}`}
    >
      {children}
    </Tag>
  );
}
