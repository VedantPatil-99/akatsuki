import puppeteer from "puppeteer-core";

export async function captureScribblePdf(jobId: string): Promise<Buffer> {
  // 1. Safely grab and sanitize the base URL
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not defined in environment variables."
    );
  }

  // Remove trailing slash if you accidentally added one in your .env
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Enforce protocol (just in case it's missing)
  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  const targetUrl = `${baseUrl}/scribble/render/${jobId}`;

  // This log will print in your Next.js terminal so you can verify it looks right!
  console.log(`[Scribble PDF] Browserless navigating to: ${targetUrl}`);

  // 2. Connect to Browserless
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
  });

  const page = await browser.newPage();

  try {
    // Bypass the ngrok security warning
    await page.setExtraHTTPHeaders({
      "ngrok-skip-browser-warning": "true",
    });

    // Navigate to our cleanly formatted URL
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    // Wait for the React component to signal it has finished mounting/rendering
    await page.waitForSelector("#render-complete-marker", { timeout: 15000 });

    // Capture the A4 PDF
    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfUint8Array);
  } catch (error) {
    console.error("PDF Capture Error:", error);
    throw new Error("Failed to generate PDF via Browserless");
  } finally {
    await browser.close();
  }
}
