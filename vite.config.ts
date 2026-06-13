import devServer from "@hono/vite-dev-server"
import path from "path"
import fs from "fs"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// 所有需要SPA回退的路由
const SPA_ROUTES = [
  "ai-decision",
  "training",
  "skills",
  "skill-scores",
  "support",
  "compatibility",
  "races",
  "links",
];

// Vite 插件：构建后将index.html复制到各路由目录，解决静态部署SPA 404
const spaFallbackPlugin = () => ({
  name: "spa-fallback",
  closeBundle() {
    const outDir = path.resolve(__dirname, "dist/public");
    const indexHtml = path.join(outDir, "index.html");
    if (!fs.existsSync(indexHtml)) return;
    const content = fs.readFileSync(indexHtml, "utf-8");
    // 复制到各路由子目录
    for (const route of SPA_ROUTES) {
      const dir = path.join(outDir, route);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), content);
    }
    // 同时创建404.html作为通用回退
    fs.writeFileSync(path.join(outDir, "404.html"), content);
    console.log("[spa-fallback] Copied index.html to", SPA_ROUTES.length, "routes + 404.html");
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react(), spaFallbackPlugin()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  base: "/uma-wiki/",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
