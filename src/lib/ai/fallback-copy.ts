/** Template copy fallback saat provider AI tidak tersedia. */

const MARKETPLACES = ["Shopee", "Tokopedia", "TikTok Shop", "Amazon", "Lazada", "Etsy"];

export function generateCopyText(input: Record<string, unknown>): string {
  const name = String(input.productName ?? "Produk Premium");
  const marketplace = String(input.marketplace ?? "Shopee");
  const type = String(input.type ?? "description");
  const keywords = String(input.keywords ?? "murah, original, garansi");
  const tone = String(input.tone ?? "professional");
  const mp = MARKETPLACES.find((m) => m.toLowerCase().includes(marketplace.toLowerCase())) ?? marketplace;

  const templates: Record<string, string> = {
    title: `[${mp}] ${name} — ${keywords.split(",")[0]?.trim()} | Gratis Ongkir`,
    description: `${name} — solusi terbaik untuk kebutuhan Anda di ${mp}.\n\n✅ Kualitas premium\n✅ Pengiriman cepat\n✅ Garansi resmi\n\n${keywords}\n\nTone: ${tone}`,
    caption: `🔥 ${name} sudah ready stock!\n\n${keywords.split(",").map((k) => `#${k.trim().replace(/\s+/g, "")}`).join(" ")}\n\nBeli sekarang di ${mp}! 👇`,
    script: `[OPENING]\nHalo semua! Hari ini aku mau review ${name}.\n\n[BODY]\nFitur utama: ${keywords}.\nHarga terbaik di ${mp}.\n\n[CTA]\nLink di bio — jangan sampai kehabisan!`,
    keywords,
    seo: `Beli ${name} di ${mp}. ${keywords}. Gratis ongkir, garansi, review 4.9★.`,
    facebook_ads: `🛒 ${name}\n\nTransform your routine with ${name}. Limited offer on ${mp}!\n\nCTA: Shop Now`,
    google_ads: `${name} | Best Price ${mp} | Free Shipping | Buy ${name} Today`,
    tiktok_ads: `POV: You found ${name} 😍 #fyp #${mp.toLowerCase().replace(/\s/g, "")}`,
    instagram_ads: `New drop ✨ ${name}\n\nTap to shop → ${mp}`,
    hashtag: keywords
      .split(",")
      .map((k) => `#${k.trim().replace(/\s+/g, "")}`)
      .join(" "),
    cta: `Beli ${name} sekarang — diskon terbatas di ${mp}!`,
  };

  return templates[type] ?? templates.description!;
}
