interface MarqueeProps {
  items: string[];
  speed?: "slow" | "normal" | "fast";
  reverse?: boolean;
  accentColor?: string;
}

export default function Marquee({
  items,
  speed = "normal",
  reverse = false,
  accentColor = "#FFD93D",
}: MarqueeProps) {
  const doubled = [...items, ...items];

  const durationMap = {
    slow: "40s",
    normal: "28s",
    fast: "16s",
  };

  return (
    <div className="overflow-hidden">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${durationMap[speed]} linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-5 mono-tag text-black/70"
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
