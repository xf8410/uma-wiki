import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./sections/Navbar";
import Home from "./pages/Home";
import SpecialWeek from "./pages/SpecialWeek";
import SummerSpecialWeek from "./pages/SummerSpecialWeek";
import KimonoSpecialWeek from "./pages/KimonoSpecialWeek";
import MrCB from "./pages/MrCB";
import MrCBFlower from "./pages/MrCBFlower";
import StayGold from "./pages/StayGold";
import MejiroDoberSummer from "./pages/MejiroDoberSummer";
import MejiroPeak from "./pages/MejiroPeak";
import MejiroPeakWedding from "./pages/MejiroPeakWedding";
import ManhattanCafeWedding from "./pages/ManhattanCafeWedding";
import ManhattanCafeSayo from "./pages/ManhattanCafeSayo";
import ManhattanCafeBase from "./pages/ManhattanCafeBase";
import UmaComingSoon from "./pages/UmaComingSoon";
import SkillIndex from "./pages/SkillIndex";
import CompatibilityIndex from "./pages/compatibility/CompatibilityIndex";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Existing pages - old paths */}
        <Route path="/uma/特别周" element={<SpecialWeek />} />
        <Route path="/uma/泳装特别周" element={<SummerSpecialWeek />} />
        <Route path="/uma/中山大奖赛特别周" element={<KimonoSpecialWeek />} />
        <Route path="/uma/千名代表" element={<MrCB />} />
        <Route path="/uma/花道千明代表" element={<MrCBFlower />} />
        <Route path="/uma/黄金旅程" element={<StayGold />} />
        <Route path="/uma/夏装目白多伯" element={<MejiroDoberSummer />} />
        <Route path="/uma/目白高峰" element={<MejiroPeak />} />
        <Route path="/uma/婚纱目白高峰" element={<MejiroPeakWedding />} />
        <Route path="/uma/柳緑小夜" element={<ManhattanCafeSayo />} />
        <Route path="/uma/婚纱曼城茶座" element={<ManhattanCafeWedding />} />

        {/* New cardId paths for existing pages */}
        <Route path="/uma/特别周_100101" element={<SpecialWeek />} />
        <Route path="/uma/特别周_100102" element={<SummerSpecialWeek />} />
        <Route path="/uma/特别周_100103" element={<KimonoSpecialWeek />} />
        <Route path="/uma/千明代表_105701" element={<MrCB />} />
        <Route path="/uma/千明代表_105702" element={<MrCBFlower />} />
        <Route path="/uma/黄金旅程_118601" element={<StayGold />} />
        <Route path="/uma/目白多伯_105901" element={<MejiroDoberSummer />} />
        <Route path="/uma/目白多伯_105902" element={<MejiroDoberSummer />} />
        <Route path="/uma/目白拉茉奴_107401" element={<MejiroPeak />} />
        <Route path="/uma/目白拉茉奴_107402" element={<MejiroPeakWedding />} />
        <Route path="/uma/曼城茶座_102501" element={<ManhattanCafeBase />} />
        <Route path="/uma/曼城茶座_102502" element={<ManhattanCafeWedding />} />

        {/* Coming soon for uncreated pages */}
        <Route path="/uma/*" element={<UmaComingSoon />} />

        <Route path="/skills" element={<SkillIndex />} />

        {/* Compatibility Calculator */}
        <Route path="/compatibility" element={<CompatibilityIndex />} />
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          },
        }}
      />
    </div>
  );
}
