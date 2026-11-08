import { useState } from 'react';
import { imageSrc, reviewTryon, tryOnFromImage, type OutfitRender, type OutfitReview } from '../services/api';
import type { PickedImage } from '../lib/image';
import { ImageDrop } from '../components/ImageDrop';
import { Busy } from '../components/Busy';

type Category = 'top' | 'dress' | 'outerwear';

const CATEGORY_LABELS: Record<Category, string> = {
  top: 'Top / shirt',
  dress: 'Dress / one-piece',
  outerwear: 'Jacket / outerwear',
};

const tone = (score: number) => (score >= 85 ? 'pass' : score >= 60 ? 'warn' : 'fail');

interface Props {
  hasBody: boolean;
  onNeedProfile: () => void;
}

export function TryOnPage({ hasBody, onNeedProfile }: Props) {
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>('top');
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<OutfitRender | null>(null);
  const [review, setReview] = useState<OutfitReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = hasBody && (mode === 'upload' ? Boolean(image) : /^https?:\/\//i.test(url.trim()));

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setReview(null);
    try {
      const r = await tryOnFromImage(
        mode === 'upload' && image
          ? { sourceImage: { base64: image.base64, mimeType: image.mimeType }, category }
          : { sourceUrl: url.trim(), category }
      );
      setResult(r);
      if (r.status !== 'ready' || !r.previewImageBase64) {
        setError('The try-on service is unavailable right now. Try again in a few minutes.');
        return;
      }
      setBusy(false);
      setReviewing(true);
      try {
        setReview(await reviewTryon({ base64: r.previewImageBase64, mimeType: 'image/jpeg' }, r.tryonId));
      } catch {
        setError('The try-on worked, but the stylist review failed. Check that the AI model is running.');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Try-on failed. The free Hugging Face Space may be busy, so try again shortly.');
    } finally {
      setBusy(false);
      setReviewing(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Try on</h1>
          <p>See any outfit on your body: a photo, a screenshot, or a Pinterest link.</p>
        </div>
      </div>

      {!hasBody && (
        <div className="notice" style={{ marginBottom: 16 }}>
          Add your body photo first. <button className="link" onClick={onNeedProfile}>Go to profile</button>
        </div>
      )}
      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="grid-2">
        <div className="card stack">
          <div className="segmented" role="tablist">
            <button role="tab" aria-selected={mode === 'upload'} className={mode === 'upload' ? 'on' : ''} onClick={() => setMode('upload')}>Upload image</button>
            <button role="tab" aria-selected={mode === 'link'} className={mode === 'link' ? 'on' : ''} onClick={() => setMode('link')}>Paste link</button>
          </div>
          {mode === 'upload' ? (
            <ImageDrop value={image} onChange={setImage} onError={setError} label="Outfit image" hint="Drop a photo or screenshot, or click to browse" maxSize={1024} />
          ) : (
            <div>
              <span className="label">Image or Pinterest link</span>
              <input className="input" value={url} placeholder="https://…" onChange={(e) => setUrl(e.target.value)} />
              <p className="muted small" style={{ marginTop: 8 }}>For a Pinterest pin, paste the pin link; the pin&rsquo;s image is used. A direct image link works too.</p>
            </div>
          )}
          <div>
            <span className="label">What should be tried on?</span>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <p className="muted small">The free try-on model dresses the upper body only. It works best when the garment is shown on its own.</p>
          {busy ? <Busy message="Dressing you in this outfit. This can take a few minutes" /> : (
            <button className="btn primary" disabled={!ready || reviewing} onClick={run}>Try on my body</button>
          )}
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Result</h3>
          {!result && !busy && <p className="muted small">Your try-on will appear here.</p>}
          {result?.previewImageBase64 && <img className="result-img" src={imageSrc(result.resultImageUrl) ?? `data:image/jpeg;base64,${result.previewImageBase64}`} alt="Try-on result" />}
          {result?.warnings.map((w, i) => <div key={i} className="notice">{w}</div>)}
          {reviewing && <Busy message="Stylist is reviewing the look" />}
          {review && (
            <div className="stack">
              <div className="row">
                <span className={`score-pill big ${tone(review.score * 10)}`}>{review.score}<small>/10</small></span>
                <strong>{review.verdict}</strong>
              </div>
              {review.strengths?.length > 0 && <div><span className="label">Works well</span><ul className="plain">{review.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
              {review.issues?.length > 0 && <div><span className="label">Could be better</span><ul className="plain">{review.issues.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
              {review.swaps?.length > 0 && <div><span className="label">Try this</span><ul className="plain">{review.swaps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
