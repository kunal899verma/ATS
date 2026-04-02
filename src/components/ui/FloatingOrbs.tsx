const ORBS = [
  { size: 400, x: "10%",  y: "20%", color: "bg-indigo-500/6",   dur: 8,  delay: 0 },
  { size: 500, x: "75%",  y: "60%", color: "bg-violet-500/5",   dur: 10, delay: 2 },
  { size: 300, x: "45%",  y: "80%", color: "bg-indigo-500/4",   dur: 7,  delay: 1 },
  { size: 250, x: "85%",  y: "10%", color: "bg-emerald-500/4",  dur: 9,  delay: 3 },
  { size: 350, x: "5%",   y: "70%", color: "bg-violet-500/4",   dur: 11, delay: 1.5 },
];

export function FloatingOrbs({ count = 5 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBS.slice(0, count).map((orb, i) => (
        <div
          key={i}
          className={`ambient-orb absolute rounded-full ${orb.color} blur-[80px] ${i > 1 ? "ambient-orb-mobile-hidden" : ""}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            animationDuration: `${orb.dur}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
