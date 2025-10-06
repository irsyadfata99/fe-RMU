// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Setup MSW worker dengan semua handlers
export const worker = setupWorker(...handlers);

// Optional: Log semua requests yang di-intercept
if (process.env.NODE_ENV === "development") {
  worker.events.on("request:start", ({ request }) => {
    console.log("[MSW]", request.method, request.url);
  });
}
