import { Link } from "react-router";
import { ArrowLeft, Star, Heart } from "lucide-react";
import HeroSection from "../sections/HeroSection";
import CostumeTabs from "../sections/CostumeTabs";
import AdaptationTable from "../sections/AdaptationTable";
import UniqueSkill from "../sections/UniqueSkill";
import InheritSkill from "../sections/InheritSkill";

export default function SpecialWeek() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Back Button */}
      <div className="fixed top-20 left-4 z-40">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回图鉴</span>
        </Link>
      </div>

      <main>
        <HeroSection />
        <CostumeTabs />
        <AdaptationTable />
        <UniqueSkill />
        <InheritSkill />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
              <span className="text-lg font-bold">
                赛马娘<span className="text-[accent-pink]">Wiki</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
              <span>for Umamusume fans</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              赛马娘 Pretty Derby 版权归 Cygames 所有 | 本站为 fan-made 项目
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
