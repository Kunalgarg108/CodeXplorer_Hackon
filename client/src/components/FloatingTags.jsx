import { useScroll, useTransform, motion } from "framer-motion";

const TAGS = [
  { label: "Groceries", emoji: "🛒", color: "#ff4433", rotate: "-8deg",  top: "10%",  left: "12%",   dirX: -0.8, dirY: -0.2, delay: "0s",    dur: "4.2s" },
  { label: "Income",    emoji: "💰", color: "#00cc4b", rotate: "11deg",  top: "12%",  right: "10%",  dirX: 0.8,  dirY: -0.3, delay: "0.6s",  dur: "5s"   },
  { label: "Home",      emoji: "🏠", color: "#ff8833", rotate: "-5deg",  bottom: "28%", left: "10%", dirX: -1.0, dirY: 0.4,  delay: "1.1s",  dur: "4.7s" },
  { label: "Savings",   emoji: "🎯", color: "#ffcc02", rotate: "9deg",   bottom: "22%", right: "8%", dirX: 1.0,  dirY: 0.3,  delay: "0.3s",  dur: "5.4s" },
  { label: "Travel",    emoji: "✈️", color: "#00acfe", rotate: "-12deg", top: "42%",  left: "5%",   dirX: -0.9, dirY: -0.1, delay: "1.8s",  dur: "3.9s" },
  { label: "Bills",     emoji: "📄", color: "#5c6f8a", rotate: "7deg",   top: "48%",  right: "4%",  dirX: 0.9,  dirY: -0.4, delay: "0.9s",  dur: "4.5s" },
  { label: "Food",      emoji: "🍕", color: "#ea687c", rotate: "-6deg",  bottom: "6%", left: "14%",  dirX: -0.7, dirY: 0.5,  delay: "2.1s",  dur: "5.1s" },
  { label: "Goals",     emoji: "⭐", color: "#9019e6", rotate: "8deg",   top: "24%",  right: "18%", dirX: 0.6,  dirY: 0.2,  delay: "0.5s",  dur: "4.8s" },
  { label: "Health",    emoji: "💊", color: "#ff33aa", rotate: "-9deg",  top: "74%",  left: "24%",  dirX: -0.5, dirY: 0.3,  delay: "1.4s",  dur: "4.3s" },
  { label: "Shopping",  emoji: "🛍️", color: "#94ae43", rotate: "6deg",   top: "32%",  right: "24%", dirX: 0.5,  dirY: -0.2, delay: "2.5s",  dur: "5.6s" },
];

export default function FloatingTags() {
  const { scrollY } = useScroll();

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50%       { transform: translateY(-12px) rotate(var(--rot)); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50%       { transform: translateY(10px) rotate(var(--rot)); }
        }
        .ftag {
          animation: floatUp var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        .ftag:nth-child(even) {
          animation-name: floatDown;
        }
      `}</style>

      {/* Center the tag container inside a max-w-[1200px] container matching the design layout */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] pointer-events-none overflow-hidden hidden md:block z-20">
        {TAGS.map((tag) => {
          // Framer Motion scroll parallax transforms
          // As scrollY goes from 0 to 800, translate the tags outwards/inwards based on dirX and dirY
          const translateX = useTransform(scrollY, [0, 800], [0, tag.dirX * 180]);
          const translateY = useTransform(scrollY, [0, 800], [0, tag.dirY * 120]);

          return (
            <motion.span
              key={tag.label}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                top: tag.top,
                left: tag.left,
                right: tag.right,
                bottom: tag.bottom,
                x: translateX,
                y: translateY,
              }}
              whileHover={{ scale: 1.1, zIndex: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span
                className="ftag category-tag"
                style={{
                  "--rot": tag.rotate,
                  "--dur": tag.dur,
                  "--delay": tag.delay,
                  background: tag.color,
                  boxShadow: `0 0 18px ${tag.color}55, rgba(255,255,255,0.18) 1px 1px 2px inset`,
                  display: "inline-flex",
                }}
              >
                <span>{tag.emoji}</span>
                {tag.label}
              </span>
            </motion.span>
          );
        })}
      </div>
    </>
  );
}
