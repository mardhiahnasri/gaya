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
  return data.data;
}

/**
 * Save an analysed item to the backend wardrobe.
 */
export async function saveToWardrobe(analysis: ClothingAnalysis, imageUri?: string): Promise<WardrobeItem> {
  const { data } = await api.post('/api/wardrobe', { analysis, imageUri });
  return data.data;
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

export async function renderOutfit(personImage: TryOnImageInput, itemIds: string[], fitNotes?: string): Promise<OutfitRender> {
  const { data } = await api.post('/api/outfits/render', { personImage, itemIds, fitNotes }, LONG_TIMEOUT);
  return data.data;
}

export async function reviewOutfit(
  image: TryOnImageInput,
  itemIds: string[],
  occasion: string,
  profile: StyleProfile
): Promise<OutfitReview> {
  const { data } = await api.post('/api/outfits/review', { image, itemIds, occasion, profile }, LONG_TIMEOUT);
  return data.data;
}
