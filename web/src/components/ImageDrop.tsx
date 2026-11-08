import { useRef, useState } from 'react';
import { readImage, type PickedImage } from '../lib/image';

interface Props {
  value: PickedImage | null;
  onChange: (img: PickedImage) => void;
  onError?: (message: string) => void;
  label: string;
  hint?: string;
  maxSize?: number;
}

export function ImageDrop({ value, onChange, onError, label, hint, maxSize }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handle = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      onChange(await readImage(file, maxSize));
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Could not read that image.');
    }
  };

  return (
    <div
      className={`dropzone${over ? ' over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
    >
      {value ? (
        <img src={value.dataUrl} alt={label} />
      ) : (
        <>
          <svg className="drop-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" /></svg>
          <strong>{label}</strong>
          <span className="small">{hint ?? 'Drop an image here or click to browse'}</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
}
