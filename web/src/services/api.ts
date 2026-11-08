import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // local AI models can take minutes on CPU
  headers: { 'Content-Type': 'application/json' },
});

export type Category = 'top' | 'bottom' | 'dress' | 'outerwear' | 'hijab' | 'shoes' | 'accessory';
export type StyleProfile = 'hijab' | 'modest' | 'none';

export interface ClothingAnalysis {
  type: string;
  category?: Category;
  pattern?: string;
  formality?: string;
  sleeves?: string;
  length?: string;
  fit?: string;
  neckline?: string;
  sheer?: boolean;
  size?: string;
  dominantColours: string[];
  colourNames: string[];
  fabric: string;
  style: string;
  culturalOrigin: string;
  suitableOccasions: string[];
  description: string;
}

export interface WardrobeItem extends ClothingAnalysis {
  id: string;
  imageUri: string | null;
  addedAt: string;
}

export interface OutfitSuggestion {
  outfitName: string;
  items: number[];
  colourHarmony: string;
  whyItWorks: string;
  colourPalette: string[];
  tips: string;
}

export interface ColourAnalysis {
  harmonyType: string;
  score: number;
  verdict: string;
  culturalNotes: string;
  suggestedAccents: string[];
}

export interface TryOnImageInput {
  base64: string;
  mimeType?: string;
}

export interface TryOnGarmentInput extends TryOnImageInput {
  category?: string;
  name?: string;
}

export interface VirtualTryOnResult {
  status: 'ready' | 'provider_unavailable';
  provider: string;
  previewImageBase64?: string;
  previewImageUrl?: string;
  fitNotes?: string;
  warnings: string[];
}

/**
 * Analyse a clothing item from a base64-encoded image.
 */
export async function analyzeClothing(base64: string, mimeType = 'image/jpeg'): Promise<ClothingAnalysis> {
  const { data } = await api.post('/api/analyze/clothing', { base64, mimeType });
  return data.data;
}

/**
 * Analyse colour compatibility.
 */
export async function analyseColours(colours: string[]): Promise<ColourAnalysis> {
  const { data } = await api.post('/api/analyze/colours', { colours });
  return data.data;
}

/**
 * Get outfit suggestions for an occasion.
 */
export async function getOutfitSuggestions(
  wardrobeItems: ClothingAnalysis[],
  occasion: string,
  culturalContext = 'Any'
): Promise<OutfitSuggestion[]> {
  const { data } = await api.post('/api/suggest/outfits', {
    wardrobeItems,
    occasion,
    culturalContext,
  });
  return data.data;
}

/**
 * Fetch all wardrobe items from backend.
 */
export async function getWardrobe(): Promise<WardrobeItem[]> {
  const { data } = await api.get('/api/wardrobe');
  return data.data.map((i: WardrobeItem) => ({ ...i, imageUri: imageSrc(i.imageUri) }));
}

/**
 * Save an analysed item to the backend wardrobe.
 */
export async function saveToWardrobe(analysis: ClothingAnalysis, imageUri?: string): Promise<WardrobeItem> {
  const { data } = await api.post('/api/wardrobe', { analysis, imageUri });
  return { ...data.data, imageUri: imageSrc(data.data.imageUri) };
}

/**
 * Remove an item from the wardrobe.
 */
export async function deleteFromWardrobe(id: string): Promise<void> {
  await api.delete(`/api/wardrobe/${id}`);
}

/**
 * Generate a body-aware virtual try-on preview using a full-body image and one or more garment images.
 */
export async function generateVirtualTryOnPreview(
  personImage: TryOnImageInput,
  garmentImages: TryOnGarmentInput[],
  fitNotes?: string
): Promise<VirtualTryOnResult> {
  const { data } = await api.post('/api/tryon/preview', {
    personImage,
    garmentImages,
    fitNotes,
  });
  return data.data;
}

export interface OutfitCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface OutfitScore {
  score: number;
  checks: OutfitCheck[];
}

export interface MatchedOutfit extends OutfitScore {
  itemIds: string[];
}

export interface OutfitReview {
  score: number;
  verdict: string;
  strengths: string[];
  issues: string[];
  swaps: string[];
}

export interface OutfitRender {
  status: 'ready' | 'provider_unavailable';
  previewImageBase64?: string;
  tryonId?: string;
  resultImageUrl?: string;
  fitNotes?: string;
  warnings: string[];
}

const LONG_TIMEOUT = { timeout: 900000 };

export async function updateWardrobeItem(id: string, patch: Partial<WardrobeItem>): Promise<WardrobeItem> {
  const { data } = await api.patch(`/api/wardrobe/${id}`, patch);
  return data.data;
}

export async function matchOutfits(occasion: string, profile: StyleProfile): Promise<MatchedOutfit[]> {
  const { data } = await api.post('/api/outfits/match', { occasion, profile });
  return data.data;
}

export async function scoreOutfit(itemIds: string[], occasion: string, profile: StyleProfile): Promise<OutfitScore> {
  const { data } = await api.post('/api/outfits/score', { itemIds, occasion, profile });
  return data.data;
}

/** personImage is optional: the saved body photo from the profile is used by default. */
export async function renderOutfit(itemIds: string[], occasion?: string, personImage?: TryOnImageInput): Promise<OutfitRender> {
  const { data } = await api.post('/api/outfits/render', { personImage, itemIds, occasion }, LONG_TIMEOUT);
  return data.data;
}

export async function reviewOutfit(
  image: TryOnImageInput,
  itemIds: string[],
  occasion: string,
  profile: StyleProfile,
  tryonId?: string
): Promise<OutfitReview> {
  const { data } = await api.post('/api/outfits/review', { image, itemIds, occasion, profile, tryonId }, LONG_TIMEOUT);
  return data.data;
}

/** Image URLs from the backend are relative (/api/images/<id>); make them absolute for native apps. */
export function imageSrc(uri: string | null | undefined): string | null {
  if (!uri) return null;
  return uri.startsWith('/') ? `${API_BASE_URL}${uri}` : uri;
}

export type BodyShape = 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle' | 'not-sure';

export interface Profile {
  bodyPhoto: string | null;
  heightCm: number | null;
  weightKg: number | null;
  topSize: string;
  bottomSize: string;
  shoeSize: string;
  bodyShape: BodyShape;
  ageGroup: 'teen' | '20s' | '30s' | '40s' | '50s+' | null;
  gender: 'female' | 'male' | 'non-binary' | null;
  modesty: StyleProfile;
  region: string;
  budget: 'low' | 'mid' | 'high' | null;
  colourSeason: string;
  skinTone: string;
}

export async function getProfile(): Promise<Profile> {
  const { data } = await api.get('/api/profile');
  return { ...data.data, bodyPhoto: imageSrc(data.data.bodyPhoto) };
}

/** Partial update. bodyPhoto: a data URL to replace the photo, or null to remove it. */
export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  const { data } = await api.put('/api/profile', patch);
  return { ...data.data, bodyPhoto: imageSrc(data.data.bodyPhoto) };
}

export interface TryOnFromImageInput {
  sourceImage?: TryOnImageInput;
  sourceUrl?: string;
  category: 'top' | 'dress' | 'outerwear';
}

/** Try on any outfit image (upload or link) using the saved body photo. */
export async function tryOnFromImage(input: TryOnFromImageInput): Promise<OutfitRender> {
  const { data } = await api.post('/api/tryon/from-image', input, LONG_TIMEOUT);
  return data.data;
}

export async function reviewTryon(image: TryOnImageInput, tryonId?: string): Promise<OutfitReview> {
  const { data } = await api.post('/api/tryon/review', { image, tryonId }, LONG_TIMEOUT);
  return data.data;
}
