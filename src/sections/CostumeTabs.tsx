import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, GraduationCap, PenTool, Sparkles } from "lucide-react";

const costumes = [
  {
    id: "victory",
    label: "决胜服",
    sublabel: "Victory",
    image: "/images/special-week-victory.png",
    icon: Sparkles,
  },
  {
    id: "uniform",
    label: "制服",
    sublabel: "Uniform",
    image: "/images/special-week-uniform.png",
    icon: GraduationCap,
  },
  {
    id: "original",
    label: "原案",
    sublabel: "Original",
    image: "/images/special-week-original.png",
    icon: PenTool,
  },
  {
    id: "stage",
    label: "舞台服",
    sublabel: "Stage",
    image: "/images/special-week-stage.png",
    icon: Shirt,
  },
];

export default function CostumeTabs() {
  const [activeCostume, setActiveCostume] = useState("victory");

  const activeData = costumes.find((c) => c.id === activeCostume)!;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Section Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            服装一览
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Costume Gallery
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {costumes.map((costume) => {
            const Icon = costume.icon;
            const isActive = activeCostume === costume.id;
            return (
              <button
                key={costume.id}
                onClick={() => setActiveCostume(costume.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--accent-pink)] text-white shadow-lg"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{costume.label}</span>
              </button>
            );
          })}
        </div>

        {/* Image Display */}
        <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] lg:max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCostume}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[3/5] w-full"
            >
              <img
                src={activeData.image}
                alt={`特别周 - ${activeData.label}`}
                className="h-full w-full object-contain"
              />
              {/* Label Overlay */}
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-1.5 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">
                  {activeData.label}
                </span>
                <span className="ml-2 text-xs text-white/60">
                  {activeData.sublabel}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
