// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Setup MSW worker dengan semua handlers
export const worker = setupWorker(...handlers);

// Enhanced logging untuk debug
if (process.env.NODE_ENV === "development") {
  worker.events.on("request:start", ({ request }) => {
    // Cek apakah request ke /auth atau /members
    const url = new URL(request.url);
    const isAuthOrMember =
      url.pathname.includes("/auth") || url.pathname.includes("/members");

    if (isAuthOrMember) {
      console.log(
        "[MSW] 🔄 Request:",
        request.method,
        url.pathname,
        "- Should PASSTHROUGH to backend"
      );
    } else {
      console.log("[MSW] ✋ Intercepted:", request.method, url.pathname);
    }
  });

  worker.events.on("request:match", ({ request }) => {
    console.log("[MSW] ✅ Handler matched:", request.method, request.url);
  });

  worker.events.on("request:unhandled", ({ request }) => {
    console.log("[MSW] ⚠️ Unhandled request:", request.method, request.url);
  });
}
