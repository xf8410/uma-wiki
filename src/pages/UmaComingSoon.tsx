import { motion } from "framer-motion";
import { Link, useParams } from "react-router";
import { ArrowLeft, Construction } from "lucide-react";

export default function UmaComingSoon() {
  const params = useParams();
  const name = decodeURIComponent(params["*"] || "未知马娘").replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="fixed top-20 left-4 z-40">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回图鉴</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Construction className="mx-auto mb-4 h-16 w-16 text-[var(--text-muted)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {name}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            该马娘的详细页面正在建设中...
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            数据后续手动补充
          </p>
        </motion.div>
      </div>
    </div>
  );
}
