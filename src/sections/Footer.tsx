import { motion } from "framer-motion";
import { Star, Heart, Github } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      id="about"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
            <span className="text-lg font-bold text-[var(--text-primary)]">
              赛马娘<span className="text-[var(--accent-pink)]">Wiki</span>
            </span>
          </div>

          <p className="max-w-md text-center text-sm leading-relaxed text-[var(--text-muted)]">
            这是一个由玩家自发维护的赛马娘中文Wiki项目。
            所有数据均从日服手动搬运，力求准确无误。
            如有错误，欢迎指出。
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent-pink)]"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
            <span>for Umamusume fans</span>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              赛马娘 Pretty Derby 版权归 Cygames 所有 | 本站为 fan-made 项目，与官方无关
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
