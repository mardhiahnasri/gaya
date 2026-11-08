import { useEffect, useState } from 'react';
import { getProfile, saveProfile, type Profile } from '../services/api';
import type { PickedImage } from '../lib/image';
import { ImageDrop } from '../components/ImageDrop';
import { Busy } from '../components/Busy';

type Fields = Omit<Profile, 'bodyPhoto'>;

const SHAPES = ['not-sure', 'hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle'];
const AGES = ['teen', '20s', '30s', '40s', '50s+'];
const GENDERS = ['female', 'male', 'non-binary'];
const BUDGETS = ['low', 'mid', 'high'];
const SEASONS = ['', 'Spring', 'Summer', 'Autumn', 'Winter'];

const toFields = ({ bodyPhoto: _photo, ...rest }: Profile): Fields => rest;

export function ProfilePage({ onSaved }: { onSaved: (p: Profile) => void }) {
  const [saved, setSaved] = useState<Profile | null>(null);
  const [form, setForm] = useState<Fields | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => { setSaved(p); setForm(toFields(p)); })
      .catch(() => setError('Could not load your profile. Is the backend running?'));
  }, []);

  if (!form || !saved) return error ? <div className="error">{error}</div> : <Busy message="Loading profile" />;

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => { setForm({ ...form, [key]: value }); setOk(false); };
  const num = (v: string) => (v === '' ? null : Number(v));
  const nullable = (v: string) => (v === '' ? null : v);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const patch: Partial<Profile> = { ...form };
      if (photo) patch.bodyPhoto = photo.dataUrl;
      else if (removePhoto) patch.bodyPhoto = null;
      const next = await saveProfile(patch);
      setSaved(next);
      setForm(toFields(next));
      setPhoto(null);
      setRemovePhoto(false);
      setOk(true);
      onSaved(next);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  const currentPhoto = photo ? photo : !removePhoto && saved.bodyPhoto ? { dataUrl: saved.bodyPhoto, base64: '', mimeType: '' } : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your body photo, sizes and style. Used for try-on, fit checks and outfit scoring.</p>
        </div>
        <button className="btn primary" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
      {ok && <div className="notice" style={{ marginBottom: 16 }}>Profile saved.</div>}

      <div className="grid-2">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Body photo</h3>
          <ImageDrop
            value={currentPhoto}
            onChange={(img) => { setPhoto(img); setRemovePhoto(false); setOk(false); }}
            onError={setError}
            label="Full-body photo"
            hint="Standing, facing the camera, plain background."
            maxSize={1200}
          />
          {currentPhoto && (
            <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => { setPhoto(null); setRemovePhoto(true); setOk(false); }}>Remove photo</button>
          )}
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Style</h3>
          <div>
            <span className="label">Modesty</span>
            <select className="select" value={form.modesty} onChange={(e) => set('modesty', e.target.value as Fields['modesty'])}>
              <option value="none">No restrictions</option>
              <option value="modest">Modest</option>
              <option value="hijab">Hijab &amp; modest</option>
            </select>
          </div>
          <div>
            <span className="label">Culture / region</span>
            <input className="input" value={form.region} maxLength={40} placeholder="e.g. Malay, Kuala Lumpur" onChange={(e) => set('region', e.target.value)} />
          </div>
          <div>
            <span className="label">Budget</span>
            <select className="select" value={form.budget ?? ''} onChange={(e) => set('budget', nullable(e.target.value) as Fields['budget'])}>
              <option value="">Not set</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <span className="label">Colour season (optional)</span>
            <select className="select" value={form.colourSeason} onChange={(e) => set('colourSeason', e.target.value)}>
              {SEASONS.map((s) => <option key={s} value={s}>{s || 'Not set'}</option>)}
            </select>
          </div>
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>About you</h3>
          <div>
            <span className="label">Gender</span>
            <select className="select" value={form.gender ?? ''} onChange={(e) => set('gender', nullable(e.target.value) as Fields['gender'])}>
              <option value="">Not set</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <span className="label">Age group</span>
            <select className="select" value={form.ageGroup ?? ''} onChange={(e) => set('ageGroup', nullable(e.target.value) as Fields['ageGroup'])}>
              <option value="">Not set</option>
              {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <span className="label">Body shape</span>
            <select className="select" value={form.bodyShape} onChange={(e) => set('bodyShape', e.target.value as Fields['bodyShape'])}>
              {SHAPES.map((b) => <option key={b} value={b}>{b === 'not-sure' ? 'Not sure' : b.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Measurements and sizes</h3>
          <div className="row">
            <div style={{ flex: 1 }}>
              <span className="label">Height (cm)</span>
              <input className="input" type="number" min={100} max={230} value={form.heightCm ?? ''} onChange={(e) => set('heightCm', num(e.target.value))} />
            </div>
            <div style={{ flex: 1 }}>
              <span className="label">Weight (kg)</span>
              <input className="input" type="number" min={25} max={250} value={form.weightKg ?? ''} onChange={(e) => set('weightKg', num(e.target.value))} />
            </div>
          </div>
          <div className="row">
            <div style={{ flex: 1 }}>
              <span className="label">Top size</span>
              <input className="input" value={form.topSize} maxLength={10} placeholder="M" onChange={(e) => set('topSize', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <span className="label">Bottom size</span>
              <input className="input" value={form.bottomSize} maxLength={10} placeholder="L" onChange={(e) => set('bottomSize', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <span className="label">Shoe size</span>
              <input className="input" value={form.shoeSize} maxLength={10} placeholder="38" onChange={(e) => set('shoeSize', e.target.value)} />
            </div>
          </div>
          <p className="muted small">Items with a different size than yours get a fit warning in the studio.</p>
        </div>
      </div>
    </>
  );
}
