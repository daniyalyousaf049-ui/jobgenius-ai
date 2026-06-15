export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.jpeg"
      width={size}
      height={size}
      alt="JobGenius AI"
      className={`rounded-xl ${className}`}
      draggable={false}
    />
  );
}
