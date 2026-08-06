import { motion } from "framer-motion";

export default function PixelAvatar({ name }: { name: string }) {
    const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const size = 5;
    const cells = Array.from({ length: size * size }, (_, i) => {
        const col = i % size;
        const mirrorCol = Math.min(col, size - 1 - col);
        const row = Math.floor(i / size);
        return ((seed * (row * 3 + mirrorCol + 1) * 2654435761) >>> 0) % 3 !== 0;
    });

    const colors = [
        "rgba(139,124,219,0.9)",
        "rgba(76,141,218,0.85)",
        "rgba(69,184,199,0.8)",
    ];
    const accentColor = colors[seed % colors.length];

    return (
        <div
            className="w-12 h-12 rounded-md p-1.5 shrink-0"
            style={{
                background: "#08080c",
                boxShadow: `0 0 0 1px rgba(139,124,219,0.2), 0 0 12px rgba(139,124,219,0.06)`,
            }}
        >
            <div
                className="w-full h-full"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    gap: "1.5px",
                }}
            >
                {cells.map((lit, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: lit ? 1 : 0 }}
                        transition={{ delay: i * 0.012, duration: 0.3 }}
                        style={{
                            borderRadius: "1px",
                            background: lit ? accentColor : "rgba(255,255,255,0.03)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}