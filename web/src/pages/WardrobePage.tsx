import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeClothing, deleteFromWardrobe, getWardrobe, saveToWardrobe, updateWardrobeItem, type Category, type WardrobeItem } from '../services/api';
import { categoryOf } from './StudioPage';
import { readImage, type PickedImage } from '../lib/image';
import { ImageDrop } from '../components/ImageDrop';
import { Busy } from '../components/Busy';

const CATEGORIES: Category[] = ['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes', 'accessory'];

export function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState<'all' | Category>('all');
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number; failed: number } | null>(null);
  const bulkInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getWardrobe());
    } catch {
      setError('Could not load your wardrobe. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((i) => m.set(categoryOf(i), (m.get(categoryOf(i)) ?? 0) + 1));
    return m;
  }, [items]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'all' && categoryOf(i) !== category) return false;
      if (!q) return true;
      return [i.type, i.culturalOrigin, i.style, ...(i.colourNames ?? [])].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, filter, category]);

  const addItem = async () => {
    if (!photo) return;
    setAnalysing(true);
    setError(null);
    try {
      const analysis = await analyzeClothing(photo.base64, photo.mimeType);
      const saved = await saveToWardrobe(analysis, photo.dataUrl);
      setItems((prev) => [...prev, saved]);
      setPhoto(null);
      setAdding(false);
    } catch {
      setError('Could not analyse that photo. Check that the AI model is running, then try again.');
    } finally {
      setAnalysing(false);
    }
  };

  // Items are analysed one at a time: the local model handles a single request at a time.
  const bulkAdd = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setError(null);
    setBulk({ done: 0, total: list.length, failed: 0 });
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        const img = await readImage(list[i], 768);
        const analysis = await analyzeClothing(img.base64, img.mimeType);
        const saved = await saveToWardrobe(analysis, img.dataUrl);
        setItems((prev) => [...prev, saved]);
      } catch {
        failed++;
      }
      setBulk({ done: i + 1, total: list.length, failed });
    }
    if (failed) setError(`${failed} of ${list.length} photos could not be analysed. Check that the AI model is running, then re-add them.`);
    setBulk(null);
  };

  const changeSize = async (item: WardrobeItem, size: string) => {
    if ((item.size ?? '') === size) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, size } : i)));
    try {
      await updateWardrobeItem(item.id, { size });
    } catch {
      setError('Could not update the size.');
      load();
    }
  };

  const changeCategory = async (item: WardrobeItem, category: Category) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, category } : i)));
    try {
      await updateWardrobeItem(item.id, { category });
    } catch {
      setError('Could not update the category.');
      load();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this item from your wardrobe?')) return;
    await deleteFromWardrobe(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Wardrobe</h1>
          <p>{items.length} {items.length === 1 ? 'piece' : 'pieces'} in your collection</p>
        </div>
        <div className="row">
          <input className="input search" placeholder="Search type, colour, culture…" aria-label="Search wardrobe" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button className="btn" disabled={bulk !== null} onClick={() => bulkInput.current?.click()}>Bulk upload</button>
          <input ref={bulkInput} type="file" accept="image/*" multiple hidden onChange={(e) => { bulkAdd(e.target.files); e.target.value = ''; }} />
          <button className="btn primary" onClick={() => setAdding((v) => !v)}>{adding ? 'Close' : '+ Add item'}</button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      {items.length > 0 && (
        <div className="chips filter-chips">
          {(['all', ...CATEGORIES] as const).filter((c) => c === 'all' || counts.has(c)).map((c) => (
            <button key={c} className={`chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
              {c === 'all' ? 'All' : c}<span className="chip-count">{c === 'all' ? items.length : counts.get(c)}</span>
            </button>
          ))}
        </div>
      )}

      {bulk && <div style={{ marginBottom: 16 }}><Busy message={`Analysing ${Math.min(bulk.done + 1, bulk.total)} of ${bulk.total}`} /></div>}

      {adding && (
        <div className="card grid-2" style={{ marginBottom: 24 }}>
          <ImageDrop value={photo} onChange={(img) => { setPhoto(img); setError(null); }} onError={setError} label="Add a clothing photo" maxSize={768} />
          <div className="stack">
            <div>
              <h3>AI will detect the details</h3>
              <p className="muted small">Type, colours, fabric, style and suitable occasions are filled in automatically. Use a clear photo with one item on a plain background.</p>
            </div>
            {analysing ? <Busy message="Analysing your item" /> : (
              <button className="btn primary" disabled={!photo} onClick={addItem}>Analyse and save</button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Busy message="Loading wardrobe" />
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" aria-hidden="true">{items.length === 0 ? '👗' : '🔍'}</div>
          <h3>{items.length === 0 ? 'Your wardrobe is empty' : 'No matches'}</h3>
          <p>{items.length === 0 ? 'Add your first piece to start getting outfit ideas.' : 'Try a different search or category.'}</p>
          {items.length === 0 && <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setAdding(true)}>+ Add your first item</button>}
        </div>
      ) : (
        <div className="items-grid">
          {visible.map((item) => (
            <div key={item.id} className="card item">
              <div className="item-img">
                {item.imageUri ? <img src={item.imageUri} alt={item.type} loading="lazy" /> : '👗'}
                <button className="item-remove" onClick={() => remove(item.id)} aria-label={`Remove ${item.type}`} title="Remove">✕</button>
                <div className="swatches">
                  {item.dominantColours?.map((c, i) => <span key={i} className="swatch" style={{ background: c }} title={item.colourNames?.[i]} />)}
                </div>
              </div>
              <div className="item-body">
                <div className="item-title">{item.type}</div>
                <div className="item-meta">{[item.style, item.culturalOrigin].filter(Boolean).join(' · ')}</div>
                <div className="item-meta">{[item.sleeves && item.sleeves !== 'none' ? `${item.sleeves} sleeves` : '', item.length, item.fit].filter(Boolean).join(' · ')}</div>
                <div className="item-controls">
                  <select className="select small-select" value={categoryOf(item)} onChange={(e) => changeCategory(item, e.target.value as Category)} aria-label="Category">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="input small-select size-input" placeholder="Size" defaultValue={item.size ?? ''} maxLength={10} aria-label="Size" onBlur={(e) => changeSize(item, e.target.value.trim())} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
