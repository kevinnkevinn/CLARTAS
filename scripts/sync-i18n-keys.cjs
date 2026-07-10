const fs = require("fs");
const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));

function deepMerge(target, source) {
  for (const k of Object.keys(source)) {
    if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k])) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      deepMerge(target[k], source[k]);
    } else if (target[k] === undefined) {
      target[k] = source[k];
    }
  }
}

const overrides = {
  id: {
    settings: {
      liteMode: "Mode ringan",
      liteModeHint: "Kurangi beban untuk perangkat rendah.",
      liteModeOff: "Mode penuh",
    },
    billing: { contactSales: "Hubungi sales" },
  },
  zh: {
    settings: {
      liteMode: "精简模式",
      liteModeHint: "降低低端设备负载。",
      liteModeOff: "完整模式",
    },
    billing: { contactSales: "联系销售" },
  },
  es: {
    settings: {
      liteMode: "Modo Lite",
      liteModeHint: "Reduce la carga en dispositivos de gama baja.",
      liteModeOff: "Modo completo",
    },
    billing: { contactSales: "Contactar ventas" },
  },
};

for (const loc of ["id", "zh", "es"]) {
  const m = JSON.parse(fs.readFileSync(`messages/${loc}.json`, "utf8"));
  deepMerge(m, en);
  deepMerge(m, overrides[loc]);
  fs.writeFileSync(`messages/${loc}.json`, JSON.stringify(m, null, 2) + "\n");
  console.log("merged", loc);
}
