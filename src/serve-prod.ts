import { serve } from "bun";
import { join, resolve } from "path";

// Use absolute path to dist directory
const distDir = resolve(import.meta.dir, "../dist");

console.log(`📁 Serving from: ${distDir}`);

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // Remove leading slash
    if (filePath.startsWith("/")) {
      filePath = filePath.slice(1);
    }
    
    // Serve index.html for root
    if (filePath === "" || filePath === "/") {
      filePath = "index.html";
    }
    
    const absolutePath = join(distDir, filePath);
    const file = Bun.file(absolutePath);
    
    if (await file.exists()) {
      // Set appropriate content type
      const ext = filePath.split(".").pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        svg: "image/svg+xml",
        ico: "image/x-icon",
      };
      
      return new Response(file, {
        headers: {
          "Content-Type": contentTypes[ext || ""] || "application/octet-stream",
        },
      });
    }
    
    // For SPA routing, serve index.html for non-asset routes
    if (!filePath.includes(".")) {
      const indexFile = Bun.file(join(distDir, "index.html"));
      return new Response(indexFile, {
        headers: { "Content-Type": "text/html" },
      });
    }
    
    console.error(`❌ Not found: ${filePath} (${absolutePath})`);
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Production server running at ${server.url}`);
