/** Crossed-box image placeholder with a bracketed label. */
export default function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`ph ${className ?? ""}`}>
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" stroke="#111" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#111" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
