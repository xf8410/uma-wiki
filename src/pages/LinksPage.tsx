import { motion } from "framer-motion";
import { Star, Globe, Github, Database, Trophy, Heart, Wrench, BookOpen, ExternalLink } from "lucide-react";

const sections = [
  {
    title: "官方网站",
    icon: Globe,
    links: [
      { name: "马娘官网（日服）", url: "https://umamusume.jp/" },
      { name: "DMM马娘官网", url: "https://dmg.umamusume.jp/" },
      { name: "台服马娘官网", url: "https://uma.komoejoy.com/" },
    ],
  },
  {
    title: "百科/数据库",
    icon: Database,
    links: [
      { name: "Bwiki", url: "https://wiki.biligame.com/umamusume" },
      { name: "GameKee", url: "http://smn.gamekee.com/" },
      { name: "Gamewith", url: "https://gamewith.jp/uma-musume" },
      { name: "乌拉拉大胜利", url: "https://urarawin.com/#/" },
      { name: "ウマ娘攻略tools", url: "https://ウマ娘.攻略.tools/characters" },
    ],
  },
  {
    title: "论坛/社区",
    icon: BookOpen,
    links: [
      { name: "NGA", url: "https://bbs.nga.cn/thread.php?fid=-40743354" },
      { name: "巴哈", url: "https://forum.gamer.com.tw/A.php?bsn=34421" },
    ],
  },
  {
    title: "种马/因子",
    icon: Heart,
    links: [
      { name: "马娘DB（种马）", url: "https://uma.pure-db.com/#/search" },
      { name: "UU种马库", url: "https://uu.163.com/umamusume/" },
      { name: "GW种马", url: "https://gamewith.jp/uma-musume/article/show/260740" },
      { name: "做种马参考 (design.u-ma.org)", url: "https://design.u-ma.org/" },
      { name: "因子周回概率", url: "https://design.u-ma.org/hamster" },
      { name: "因子照片解析", url: "https://lt900ed.github.io/receipt_factor/" },
    ],
  },
  {
    title: "工具/计算器",
    icon: Wrench,
    links: [
      { name: "相性计算器 (design.u-ma.org)", url: "https://design.u-ma.org/" },
      { name: "月供排行", url: "https://61444uma.wiki/ranking" },
      { name: "竞技场技能分", url: "https://docs.qq.com/sheet/DR2JsUmtJa3FpaVVw?tab=000001" },
      { name: "4gamer攻略", url: "https://www.4gamer.net/games/414/G041434/" },
    ],
  },
  {
    title: "GitHub 开源项目",
    icon: Github,
    links: [
      { name: "UmaAi (蒙特卡洛AI)", url: "https://github.com/hzyhhzy/UmaAi" },
      { name: "UmaSimulator", url: "https://github.com/chachaw/UmaSimulator" },
      { name: "UmamusumeAutoTrainer", url: "https://github.com/shiokaze/UmamusumeAutoTrainer" },
      { name: "Umaplay (YOLO+OCR)", url: "https://github.com/Magody/Umaplay" },
      { name: "UmamusumeResponseAnalyzer", url: "https://github.com/UmamusumeResponseAnalyzer/UmamusumeResponseAnalyzer" },
      { name: "umamusume-auto-train", url: "https://github.com/samsulpanjul/umamusume-auto-train" },
      { name: "umamusume-translate", url: "https://github.com/noccu/umamusu-translate" },
      { name: "Uma Musume TT/CM Auto", url: "https://github.com/JeSuisJo/Uma_Musume_TT_CM_Auto" },
      { name: "hachimi-sd (本地化数据)", url: "https://github.com/UmaTL/hachimi-sd" },
    ],
  },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Star className="h-6 w-6 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
            赛马娘常用网站
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            整理赛马娘相关的攻略网站、数据库、工具和社区链接
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
            >
              <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center gap-2">
                <section.icon className="h-5 w-5 text-[var(--accent-pink)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{section.title}</h2>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--accent-pink)] transition-colors group"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent-pink)] transition-colors" />
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 月供排行嵌入 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
        >
          <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">月供排行</h2>
          </div>
          <div className="p-4">
            <iframe
              src="https://61444uma.wiki/ranking"
              className="w-full h-[600px] rounded-lg border border-[var(--border-subtle)]"
              title="月供排行"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
