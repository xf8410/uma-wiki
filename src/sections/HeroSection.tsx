import { motion } from "framer-motion";
import { Star, Calendar, Ruler, Weight, Mic } from "lucide-react";

const basicInfo = [
  { icon: Mic, label: "CV", value: "和气杏未" },
  { icon: Calendar, label: "生日", value: "5月2日" },
  { icon: Ruler, label: "身高", value: "158cm" },
  { icon: Weight, label: "体重", value: "微增（吃太多了）" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroSection() {
  return (
    <section
      id="uma"
      className="relative overflow-hidden pt-24 pb-12"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
      }}
    >
      {/* Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          {/* Left: Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-6"
          >
            {/* Rarity */}
            <motion.div variants={itemVariants} className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 text-yellow-400"
                  fill="currentColor"
                />
              ))}
              <span className="ml-2 text-sm text-[var(--text-muted)]">初始三星</span>
            </motion.div>

            {/* Names */}
            <motion.div variants={itemVariants} className="space-y-2">
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--accent-pink)" }}
              >
                スペシャルウィーク
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-5xl">
                特别周
              </h1>
              <p className="font-[Poppins] text-lg italic text-[var(--text-muted)]">
                Special Week
              </p>
            </motion.div>

            {/* Basic Info Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {basicInfo.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                >
                  <div className="mb-1 flex items-center gap-1.5 text-[var(--text-muted)]">
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
            >
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                从乡下前来东京的少女。虽然时不时会表现出与时代脱节的一面，
                但她的性格开朗积极，深受周围人的喜爱。梦想是成为"日本第一的赛马娘"，
                为此每天都在努力训练。非常喜欢胡萝卜，食量惊人。
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Portrait */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="relative flex-shrink-0"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,99,168,0.25) 0%, transparent 70%)",
                }}
              />
              <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <img
                  src="/images/special-week-victory.png"
                  alt="特别周 - 决胜服"
                  className="h-auto w-72 object-contain sm:w-80 lg:w-96"
                />
              </div>
              {/* Icon Badge */}
              <div className="absolute -bottom-4 -right-4 overflow-hidden rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
                <img
                  src="/images/special-week-icon.png"
                  alt="特别周头像"
                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
