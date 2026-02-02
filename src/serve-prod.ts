import { serve } from "bun";
import { join } from "path";

const distDir = join(import.meta.dir, "../dist");

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // Serve index.html for root
    if (filePath === "/") {
      filePath = "/index.html";
    }
    
    const file = Bun.file(join(distDir, filePath));
    
    if (await file.exists()) {
      return new Response(file);
    }
    
    // For SPA routing, serve index.html for non-asset routes
    if (!filePath.includes(".")) {
      const indexFile = Bun.file(join(distDir, "index.html"));
      return new Response(indexFile);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Production server running at ${server.url}`);
