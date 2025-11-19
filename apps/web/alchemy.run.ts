import alchemy from "alchemy";
import { Nextjs } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("pdp");

export const web = await Nextjs("web", {
  bindings: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "",
  },
  dev: {
    command: "bun run dev",
  },
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
