// A 5x5 mirrored pixel pattern generated from the student's name. Same name, same face.
export default function PixelAvatar({ name }: { name: string }) {
  const seed = name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const size = 5;

  const cells = Array.from({ length: size * size }, (_, i) => {
    const col = Math.min(i % size, size - 1 - (i % size)); // mirror left and right
    const row = Math.floor(i / size);
    return ((seed * (row * 3 + col + 1) * 2654435761) >>> 0) % 3 !== 0;
  });

  return (
    <div
      aria-hidden="true"
      className="grid size-14 shrink-0 grid-cols-5 gap-0.5 rounded-md border border-border-strong bg-surface-deep p-2"
    >
      {cells.map((lit, i) => (
        <span key={i} className={`rounded-[1px] ${lit ? "bg-gold" : "bg-border"}`} />
      ))}
    </div>
  );
}
