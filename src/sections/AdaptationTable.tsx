import { motion } from "framer-motion";

const gradeColors: Record<string, string> = {
  S: "var(--grade-s)", A: "var(--grade-a)", B: "var(--grade-b)",
  C: "var(--grade-c)", D: "var(--grade-d)", E: "var(--grade-e)",
  F: "var(--grade-f)", G: "var(--grade-g)",
};

interface Cell {
  label: string;
  grade: string;
  colSpan?: number;
}

/* B站Wiki格式：统一4列网格 */
const rows: { title: string; color: string; cells: Cell[] }[] = [
  {
    title: "场地",
    color: "var(--accent-orange)",
    cells: [
      { label: "草地", grade: "A" },
      { label: "泥地", grade: "G" },
      { label: "", grade: "" },
      { label: "", grade: "" },
    ],
  },
  {
    title: "距离",
    color: "var(--accent-purple)",
    cells: [
      { label: "短距离", grade: "F" },
      { label: "英里", grade: "C" },
      { label: "中距离", grade: "A" },
      { label: "长距离", grade: "A" },
    ],
  },
  {
    title: "跑法",
    color: "var(--accent-pink)",
    cells: [
      { label: "逃", grade: "G" },
      { label: "先行", grade: "A" },
      { label: "差行", grade: "A" },
      { label: "追", grade: "C" },
    ],
  },
];

export default function AdaptationTable() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8"
      >
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">适应性</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Adaptation</p>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.title}>
              {/* Row label */}
              <div className="mb-1 flex items-center gap-2">
                <div className="h-1 w-4 rounded-full" style={{ background: row.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {row.title}
                </span>
              </div>
              {/* 4-column grid — uniform cell size */}
              <div className="grid grid-cols-4 gap-2">
                {row.cells.map((cell, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={cell.grade ? { scale: 1.05 } : undefined}
                    className={`flex h-24 sm:h-28 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 ${
                      !cell.grade ? "opacity-30" : ""
                    }`}
                  >
                    {cell.grade && (
                      <>
                        <span className="mb-0.5 text-[10px] font-medium leading-none text-[var(--text-muted)] sm:text-xs">
                          {cell.label}
                        </span>
                        <span
                          className="text-2xl font-extrabold leading-none sm:text-3xl"
                          style={{ color: gradeColors[cell.grade] || "var(--text-muted)" }}
                        >
                          {cell.grade}
                        </span>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
