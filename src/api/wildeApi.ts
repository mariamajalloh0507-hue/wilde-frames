export type Lang = "en" | "no" | "sv";

export interface ApiAnimal {
  id: number;
  name: string;
  slug: string;
  description: string;
  wikiUrl: string;
  imageAspectRatio: number;
  category: string;
}

export async function fetchAnimals(lang: Lang): Promise<ApiAnimal[]> {
  const res = await fetch(`/api/${lang}/animals`);
  if (!res.ok) {
    throw new Error(`Failed to load animals (${res.status})`);
  }
  return res.json();
}

export async function fetchAnimalById(
  lang: Lang,
  id: string | number
): Promise<ApiAnimal> {
  const res = await fetch(`/api/${lang}/animals/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load animal ${id} (${res.status})`);
  }
  return res.json();
}
export interface ApiFrameSpec {
  id: string;
  name: string;
  slug: string;
  frameWidthCm: number;
  frameHeightCm: number;
  imageAreaWidthCm: number;
  imageAreaHeightCm: number;
  matOpeningWidthCm: number;
  matOpeningHeightCm: number;
  description: string;
}

export interface ApiFrameMaterial {
  id: string;
  name: string;
  slug: string;
  material: string;
  color: string;
  style: string;
  priceMultiplier: number;
  cssBackground: string;
}

export interface ApiFramePricing {
  frameSpecId: string;
  basePrice: number;
}

export async function fetchFrameSpecs(lang: Lang): Promise<ApiFrameSpec[]> {
  const res = await fetch(`/api/${lang}/frameSpecifications`);
  if (!res.ok) throw new Error(`Failed to load frame specs (${res.status})`);
  return res.json();
}

export async function fetchFrameMaterials(lang: Lang): Promise<ApiFrameMaterial[]> {
  const res = await fetch(`/api/${lang}/frameMaterials`);
  if (!res.ok) throw new Error(`Failed to load frame materials (${res.status})`);
  return res.json();
}

export async function fetchFramePricing(): Promise<ApiFramePricing[]> {
  const res = await fetch(`/api/framePricing`);
  if (!res.ok) throw new Error(`Failed to load frame pricing (${res.status})`);
  return res.json();
}

// cart
export async function addFrameToCart(payload: {
  animalId: number;
  frameSpecId: string;
  frameMaterialId: string;
  withMat: boolean;
  quantity: number;
}) {
  const res = await fetch(`/api/add-frame-to-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to add to cart (${res.status})`);
  return res.json();
}

export async function fetchCart() {
  const res = await fetch(`/api/frame-cart`);
  if (!res.ok) throw new Error(`Failed to load cart (${res.status})`);
  return res.json();
}