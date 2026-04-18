export function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E8E0D0] ${className}`}>
      {children}
    </div>
  );
}
