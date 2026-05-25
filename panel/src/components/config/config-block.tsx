interface ConfigBlockProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ConfigBlock({
  title,
  description,
  children,
}: ConfigBlockProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-white/40">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
