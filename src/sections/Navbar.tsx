import { motion } from "framer-motion";
import { Link, useLocation } from "react-router";
import { Star, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "马娘图鉴", to: "/" },
    { label: "支援卡目录", to: "/support" },
    { label: "比赛目录", to: "/races" },
    { label: "技能一览", to: "/skills" },
    { label: "相性计算器", to: "/compatibility" },
    { label: "训练模拟器", to: "/training" },
    { label: "AI实时决策", to: "/ai-decision" },
    { label: "训练记录", to: "/training-log" },
    { label: "数据收集", to: "/data-collector" },
    { label: "仪表盘", to: "/dashboard" },
    { label: "技能分数", to: "/skill-scores" },
    { label: "常用网站", to: "/links" },
  ];

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Star className="h-6 w-6 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
          <span className="text-lg font-bold text-[var(--text-primary)]">
            赛马娘<span className="text-[var(--accent-pink)]">Wiki</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`group relative text-sm font-medium transition-colors hover:text-[var(--accent-pink)] ${
                location.pathname === link.to ? "text-[var(--accent-pink)]" : "text-[var(--text-secondary)]"
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-pink)] transition-all duration-300 ${
                location.pathname === link.to ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[var(--text-secondary)] md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-pink)]"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
