import { useState } from 'react';
import { analyseColours, type ColourAnalysis } from '../services/api';
import { Busy } from '../components/Busy';

const PRESETS = [
  { name: 'Hari Raya', colours: ['#006400', '#FFD700', '#FFFFFF'] },
  { name: 'Chinese New Year', colours: ['#CC0000', '#FFD700', '#FF6600'] },
  { name: 'Deepavali', colours: ['#800080', '#FF8C00', '#FFD700'] },
  { name: 'Royal blue', colours: ['#003087', '#C0C0C0', '#FFFFFF'] },
  { name: 'Earth tones', colours: ['#8B4513', '#D2B48C', '#F5F5DC'] },
];

export function ColoursPage() {
  const [colours, setColours] = useState<string[]>(['#C7A88C', '#8E7A69']);
  const [picker, setPicker] = useState('#B5654A');
  const [result, setResult] = useState<ColourAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (next: string[]) => { setColours(next); setResult(null); setError(null); };

  const analyse = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await analyseColours(colours));
    } catch {
      setError('Could not analyse these colours. Check that the AI model is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Colour check</h1>
          <p>See how well colours pair before you wear them.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card stack">
          <div>
            <span className="label">Your palette</span>
            <div className="colour-bar">
              {colours.map((c) => <div key={c} style={{ background: c }} title={c} />)}
            </div>
            <div className="chips" style={{ marginTop: 12 }}>
              {colours.map((c) => (
                <button key={c} className="chip" onClick={() => update(colours.filter((x) => x !== c))} title="Remove">{c} ✕</button>
              ))}
            </div>
          </div>
          <div className="row">
            <input type="color" value={picker} onChange={(e) => setPicker(e.target.value)} style={{ width: 48, height: 40, border: 0, background: 'none' }} />
            <button className="btn" disabled={colours.includes(picker.toUpperCase())} onClick={() => update([...colours, picker.toUpperCase()])}>Add colour</button>
          </div>
          <div>
            <span className="label">Presets</span>
            <div className="chips">
              {PRESETS.map((p) => <button key={p.name} className="chip" onClick={() => update(p.colours)}>{p.name}</button>)}
            </div>
          </div>
          {loading ? <Busy message="Analysing colours" /> : (
            <button className="btn primary" disabled={colours.length < 2} onClick={analyse}>Analyse palette</button>
          )}
          {error && <div className="error">{error}</div>}
        </div>

        <div className="card">
          {result ? (
            <div className="stack">
              <div>
                <span className="tag">{result.harmonyType}</span>
                <div className="score">{result.score}<span className="muted" style={{ fontSize: 18 }}>/10</span></div>
              </div>
              <p>{result.verdict}</p>
              <div><span className="label">Cultural notes</span><p className="muted">{result.culturalNotes}</p></div>
              {result.suggestedAccents?.length > 0 && (
                <div>
                  <span className="label">Suggested accents</span>
                  <div className="row">
                    {result.suggestedAccents.map((c) => (
                      <button key={c} className="chip" onClick={() => update([...colours, c.toUpperCase()])}>
                        <span className="swatch" style={{ background: c, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />{c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty"><h3>No analysis yet</h3><p>Add at least two colours and analyse them.</p></div>
          )}
        </div>
      </div>
    </>
  );
}
