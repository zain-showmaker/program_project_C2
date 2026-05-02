export interface Suggestion {
  model: string;
  approxPrice: number;
  approxCost: number;
}

function s(model: string, approxPrice: number, approxCost?: number): Suggestion {
  return { model, approxPrice, approxCost: approxCost ?? Math.round(approxPrice * 0.7 * 100) / 100 };
}

export const SMART_SUGGESTIONS: Record<string, Suggestion[]> = {
  CPU: [
    s("Intel Core i3-13100", 130.0),
    s("Intel Core i5-13400", 230.0),
    s("Intel Core i5-14600K", 320.0),
    s("Intel Core i7-13700K", 410.0),
    s("Intel Core i7-14700K", 440.0),
    s("Intel Core i9-14900K", 580.0),
    s("AMD Ryzen 5 7600X", 250.0),
    s("AMD Ryzen 5 8600G", 260.0),
    s("AMD Ryzen 7 7800X3D", 450.0),
    s("AMD Ryzen 7 9700X", 410.0),
    s("AMD Ryzen 9 7950X", 620.0),
    s("AMD Ryzen 9 9950X", 700.0),
  ],
  GPU: [
    s("NVIDIA RTX 4060", 300.0),
    s("NVIDIA RTX 4060 Ti 16GB", 460.0),
    s("NVIDIA RTX 4070 Super", 620.0),
    s("NVIDIA RTX 4070 Ti Super", 820.0),
    s("NVIDIA RTX 4080 Super", 1100.0),
    s("NVIDIA RTX 4090", 1600.0),
    s("AMD RX 7600", 280.0),
    s("AMD RX 7700 XT", 450.0),
    s("AMD RX 7800 XT", 500.0),
    s("AMD RX 7900 XT", 720.0),
    s("AMD RX 7900 XTX", 950.0),
    s("Intel Arc A770 16GB", 320.0),
  ],
  RAM: [
    s("Corsair Vengeance 16GB DDR4 3200", 45.0),
    s("G.Skill Ripjaws 32GB DDR4 3600", 85.0),
    s("Crucial 16GB DDR5 5600", 65.0),
    s("Kingston Fury 32GB DDR5 6000", 120.0),
    s("G.Skill Trident Z5 32GB DDR5 6400", 140.0),
    s("Corsair Dominator 64GB DDR5 6400", 210.0),
    s("Corsair Vengeance 64GB DDR5 6000", 185.0),
  ],
  SSD: [
    s("Kingston NV2 500GB NVMe", 45.0),
    s("Samsung 970 EVO Plus 1TB NVMe", 80.0),
    s("Kingston KC3000 1TB", 100.0),
    s("WD Black SN850X 2TB", 160.0),
    s("Samsung 990 Pro 2TB", 220.0),
    s("Crucial T700 4TB Gen5", 400.0),
    s("Samsung 870 EVO 1TB SATA", 75.0),
  ],
  MOBO: [
    s("ASUS Prime B760-Plus", 140.0),
    s("ASRock B650M Pro RS", 160.0),
    s("MSI MAG B650 Tomahawk", 230.0),
    s("Gigabyte X670E Aorus Elite", 450.0),
    s("ASUS ROG Strix Z790-E", 480.0),
    s("ASUS ROG Maximus Z790 Hero", 600.0),
    s("MSI MEG Z790 Ace", 720.0),
    s("ASUS ProArt X670E Creator", 500.0),
  ],
  PSU: [
    s("Corsair CX650M 650W Bronze", 75.0),
    s("EVGA SuperNOVA 750W Gold", 120.0),
    s("Corsair RM850x 850W Gold", 160.0),
    s("Seasonic Focus GX-1000 1000W Gold", 210.0),
    s("be quiet! Dark Power 13 1300W", 320.0),
  ],
  CASE: [
    s("NZXT H5 Flow", 95.0),
    s("Lian Li Lancool 216", 110.0),
    s("Fractal Design North", 140.0),
    s("Corsair 5000D Airflow", 170.0),
    s("Lian Li O11 Dynamic EVO", 190.0),
  ],
  COOLER: [
    s("Cooler Master Hyper 212 Black", 45.0),
    s("DeepCool AK620", 65.0),
    s("Noctua NH-D15", 120.0),
    s("Arctic Liquid Freezer III 360", 130.0),
    s("Corsair iCUE H150i Elite LCD", 280.0),
  ],
};

export function listCategories(): string[] {
  return Object.keys(SMART_SUGGESTIONS);
}

export function getSuggestionsFor(category: string): Suggestion[] {
  const key = category.toUpperCase();
  return SMART_SUGGESTIONS[key] ?? [];
}
