import { useEffect, useState } from 'react';

/** Progress note that shows elapsed time, since local AI models can take a minute or more. */
export function Busy({ message }: { message: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="progress">
      <div className="spinner dark" />
      <span>{message} ({seconds}s)</span>
    </div>
  );
}
