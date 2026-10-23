import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("缺少 InsForge 配置，请设置 VITE_INSFORGE_URL 和 VITE_INSFORGE_ANON_KEY");
}

export const insforge = createClient({ baseUrl, anonKey });
