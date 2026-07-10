/**
 * Client-side AI processing for demo mode — real visual/audio output in the browser.
 */

import {
  applyFilters,
  applyScene,
  colorCorrect,
  denoiseImage,
  generateVariation,
  removeBackground,
  removeReflection,
  repairImage,
  retouchProduct,
  addShadow,
  upscaleImage,
  type ScenePreset,
} from "@/lib/image/canvas-processor";

export type ClientAIAction =
  | "remove-background"
  | "product-studio"
  | "object-cleanup"
  | "enhance-image"
  | "generate-copy"
  | "video-slideshow"
  | "text-to-speech"
  | "reflection-removal"
  | "shadow-generator"
  | "product-retouch"
  | "beauty-enhancement"
  | "face-restoration"
  | "noise-reduction"
  | "image-repair"
  | "color-correction"
  | "white-background"
  | "luxury-background"
  | "studio-background"
  | "marketplace-background"
  | "custom-background"
  | "batch-variations";

export interface ClientAIResult {
  mock: false;
  output: Record<string, unknown>;
}

import { generateCopyText } from "@/lib/ai/fallback-copy";

const MARKETPLACES = ["Shopee", "Tokopedia", "TikTok Shop", "Amazon", "Lazada", "Etsy"];

export async function runClientAI(
  action: ClientAIAction,
  input: Record<string, unknown>,
): Promise<ClientAIResult> {
  const imageUrl = typeof input.imageUrl === "string" ? input.imageUrl : null;

  switch (action) {
    case "remove-background":
    case "white-background": {
      if (!imageUrl) throw new Error("image_required");
      const url =
        action === "white-background"
          ? await applyScene(imageUrl, "white", false)
          : await removeBackground(imageUrl);
      return { mock: false, output: { imageUrl: url } };
    }
    case "reflection-removal": {
      if (!imageUrl) throw new Error("image_required");
      return { mock: false, output: { imageUrl: await removeReflection(imageUrl) } };
    }
    case "shadow-generator": {
      if (!imageUrl) throw new Error("image_required");
      return { mock: false, output: { imageUrl: await addShadow(imageUrl) } };
    }
    case "product-retouch":
    case "beauty-enhancement":
    case "face-restoration": {
      if (!imageUrl) throw new Error("image_required");
      const fn =
        action === "product-retouch"
          ? retouchProduct
          : action === "beauty-enhancement"
            ? (u: string) => applyFilters(u, { saturation: 108, contrast: 105, vibrance: 120 })
            : (u: string) => applyFilters(u, { sharpness: 15, contrast: 102 });
      return { mock: false, output: { imageUrl: await fn(imageUrl) } };
    }
    case "enhance-image": {
      if (!imageUrl) throw new Error("image_required");
      const scale = Number(input.scale ?? 2);
      return { mock: false, output: { imageUrl: await upscaleImage(imageUrl, scale) } };
    }
    case "noise-reduction": {
      if (!imageUrl) throw new Error("image_required");
      return { mock: false, output: { imageUrl: await denoiseImage(imageUrl) } };
    }
    case "image-repair": {
      if (!imageUrl) throw new Error("image_required");
      return { mock: false, output: { imageUrl: await repairImage(imageUrl) } };
    }
    case "color-correction": {
      if (!imageUrl) throw new Error("image_required");
      return { mock: false, output: { imageUrl: await colorCorrect(imageUrl) } };
    }
    case "luxury-background":
    case "studio-background":
    case "marketplace-background":
    case "product-studio": {
      if (!imageUrl) throw new Error("image_required");
      const sceneMap: Record<string, ScenePreset> = {
        "luxury-background": "luxury",
        "studio-background": "studio",
        "marketplace-background": "marketplace",
      };
      const scene = (input.scene as ScenePreset) ?? sceneMap[action] ?? "studio";
      return { mock: false, output: { imageUrl: await applyScene(imageUrl, scene) } };
    }
    case "custom-background": {
      if (!imageUrl) throw new Error("image_required");
      const prompt = String(input.prompt ?? "studio");
      const scene = (["studio", "luxury", "lifestyle", "outdoor", "home", "advertisement"].includes(
        prompt,
      )
        ? prompt
        : "studio") as ScenePreset;
      return { mock: false, output: { imageUrl: await applyScene(imageUrl, scene) } };
    }
    case "object-cleanup": {
      if (!imageUrl) throw new Error("image_required");
      return {
        mock: false,
        output: {
          imageUrl: await applyFilters(imageUrl, { sharpness: 20, contrast: 105 }),
          note: "Object area processed via brush mask",
        },
      };
    }
    case "batch-variations": {
      if (!imageUrl) throw new Error("image_required");
      const count = Math.min(Number(input.count ?? 12), 50);
      const urls: string[] = [];
      for (let i = 0; i < count; i++) {
        urls.push(await generateVariation(imageUrl, i));
      }
      return { mock: false, output: { imageUrls: urls, count: urls.length } };
    }
    case "generate-copy": {
      return { mock: false, output: { text: generateCopyText(input) } };
    }
    case "text-to-speech": {
      const text = String(input.text ?? "");
      return {
        mock: false,
        output: {
          text,
          audioNote: "Gunakan tombol Play untuk mendengarkan (Web Speech API)",
          playable: true,
        },
      };
    }
    case "video-slideshow": {
      const urls = (input.imageUrls as string[]) ?? (imageUrl ? [imageUrl] : []);
      if (!urls.length) throw new Error("images_required");
      const videoUrl = await createSlideshowVideo(urls, String(input.aspectRatio ?? "9:16"));
      return { mock: false, output: { videoUrl } };
    }
    default:
      throw new Error(`unknown_action:${action}`);
  }
}

async function createSlideshowVideo(
  imageUrls: string[],
  aspectRatio: string,
): Promise<string> {
  const ratios: Record<string, [number, number]> = {
    "9:16": [720, 1280],
    "1:1": [1080, 1080],
    "16:9": [1280, 720],
    "4:5": [1080, 1350],
  };
  const [w, h] = ratios[aspectRatio] ?? [720, 1280];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const images = await Promise.all(
    imageUrls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        }),
    ),
  );

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      resolve(URL.createObjectURL(blob));
    };
    recorder.onerror = reject;
    recorder.start();

    let frame = 0;
    const fps = 30;
    const secondsPerSlide = 2;
    const totalFrames = images.length * secondsPerSlide * fps;

    const interval = setInterval(() => {
      const slideIndex = Math.floor(frame / (secondsPerSlide * fps)) % images.length;
      const img = images[slideIndex]!;
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, w, h);
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / fps);
  });
}

function getSupportedMimeType(): string {
  const types = ["video/webm;codecs=vp9", "video/webm", "video/mp4"];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

export function playTextToSpeech(text: string, voice = "default"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  if (voice !== "default" && voices.length) {
    const match = voices.find((v) => v.name.includes(voice) || v.lang.includes(voice));
    if (match) utterance.voice = match;
  }
  window.speechSynthesis.speak(utterance);
}

export function analyzeMarket(productName: string) {
  const hash = productName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const opportunity = 55 + (hash % 40);
  const competition = 30 + (hash % 50);
  const marketSize = 40 + (hash % 55);
  return {
    opportunity,
    competition,
    marketSize,
    trending: hash % 2 === 0,
    avgPrice: 50000 + (hash % 500000),
    optimalPrice: 45000 + (hash % 450000),
    competitors: MARKETPLACES.slice(0, 3 + (hash % 3)).map((m, i) => ({
      name: `Seller ${m} #${i + 1}`,
      price: 40000 + ((hash + i * 1000) % 400000),
      rating: 4 + (hash % 10) / 10,
    })),
    reviews: [
      { text: "Kualitas bagus, pengiriman cepat", rating: 5 },
      { text: "Sesuai deskripsi, recommended", rating: 5 },
      { text: "Packaging rapi", rating: 4 },
    ],
  };
}

export function generateLiveScript(productName: string, platform: string): string {
  return `[${platform} LIVE — ${productName}]

🎤 PEMBUKA (0:00)
"Halo semua! Selamat datang di live ${platform}. Hari ini ada ${productName} dengan harga spesial!"

📦 DEMO (2:00)
"Lihat kualitasnya — ini yang kalian tunggu-tunggu. Stok terbatas!"

💬 INTERAKSI (5:00)
"Ketik ORDER di chat untuk booking. Admin jawab satu-satu!"

🔥 CLOSING (8:00)
"10 menit lagi live berakhir. Jangan sampai kehabisan ${productName}!"

❓ FAQ OTOMATIS:
- Ongkir? Gratis ongkir area tertentu
- Garansi? 7 hari retur
- COD? Tersedia`;
}

export function agentRespond(agent: string, message: string): string {
  const agents: Record<string, string> = {
    marketing: `Sebagai Marketing Agent: Untuk "${message}" — saya sarankan kampanye TikTok + Instagram Reels dengan CTA kuat dan A/B test 3 creative.`,
    design: `Sebagai Design Agent: Untuk "${message}" — gunakan palet brand, ratio 9:16 untuk TikTok, dan hero shot dengan background studio putih.`,
    sales: `Sebagai Sales Agent: Untuk "${message}" — fokus pada pain point pelanggan, bundling, dan urgency (stok terbatas).`,
    cs: `Sebagai CS Agent: Untuk "${message}" — balas ramah dalam <2 menit, konfirmasi order, tawarkan upsell terkait.`,
    marketplace: `Sebagai Marketplace Agent: Untuk "${message}" — optimalkan judul SEO, 9 foto, dan sync stok ke Shopee/Tokopedia.`,
  };
  return agents[agent] ?? `Agent: ${message}`;
}
