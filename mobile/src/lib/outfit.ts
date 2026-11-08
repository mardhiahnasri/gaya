import type { Category, WardrobeItem } from '../services/api';

export const CATEGORIES: Category[] = ['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes', 'accessory'];

export const SECTIONS: { id: Category; label: string }[] = [
  { id: 'dress', label: 'Dresses & sets' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'hijab', label: 'Hijabs & scarves' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessory', label: 'Accessories' },
];

const CATEGORY_HINTS: [Category, RegExp][] = [
  ['hijab', /hijab|tudung|shawl|scarf|selendang|bawal/i],
  ['outerwear', /blazer|jacket|cardigan|coat|kimono|vest/i],
  ['dress', /dress|gown|abaya|jubah|kurung|saree|sari|cheongsam|qipao|kaftan|jumpsuit/i],
  ['bottom', /pants|trouser|jeans|skirt|kain|shorts|palazzo|slacks/i],
  ['shoes', /shoe|heel|sandal|sneaker|boot|flat|loafer/i],
  ['accessory', /bag|belt|watch|necklace|earring|bracelet|brooch/i],
];

export function categoryOf(item: WardrobeItem): Category {
  if (item.category) return item.category;
  return CATEGORY_HINTS.find(([, re]) => re.test(item.type))?.[0] ?? 'top';
}

/** Picking one piece replaces the other in the same slot; a dress replaces top and bottom. */
export function toggleItem(ids: string[], item: WardrobeItem, byId: Map<string, WardrobeItem>): string[] {
  if (ids.includes(item.id)) return ids.filter((id) => id !== item.id);
  const cat = categoryOf(item);
  const clears: Category[] =
    cat === 'dress' ? ['dress', 'top', 'bottom'] : cat === 'top' || cat === 'bottom' ? [cat, 'dress'] : cat === 'accessory' ? [] : [cat];
  const kept = ids.filter((id) => {
    const other = byId.get(id);
    return other && !clears.includes(categoryOf(other));
  });
  return [...kept, item.id];
}

export function scoreTone(score: number): 'pass' | 'warn' | 'fail' {
  return score >= 85 ? 'pass' : score >= 60 ? 'warn' : 'fail';
}
