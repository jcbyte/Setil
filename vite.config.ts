import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { defineConfig } from "vite";
import { ManifestOptions, VitePWA } from "vite-plugin-pwa";

const manifest: Partial<ManifestOptions> = {
	name: "Setil",
	short_name: "Setil",
	description:
		"A cost-splitting web app that allows you to create groups, invite others, and easily add your expenses.",
	start_url: "/",
	display: "standalone",
	background_color: "#09090b",
	theme_color: "#09090b",
	icons: [
		{ src: "/icon/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
		{ src: "/icon/icon-192.png", type: "image/png", sizes: "192x192" },
		{ src: "/icon/icon-512.png", type: "image/png", sizes: "512x512" },
		{ src: "/icon/icon-192-maskable.png", type: "image/png", sizes: "192x192", purpose: "maskable" },
		{ src: "/icon/icon-512-maskable.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
	],
	lang: "en",
	scope: "/",
	orientation: "portrait",
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), VitePWA({ registerType: "autoUpdate", manifest })],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
