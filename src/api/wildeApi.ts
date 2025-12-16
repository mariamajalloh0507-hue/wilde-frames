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