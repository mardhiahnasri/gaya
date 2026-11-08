import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** useState that persists to AsyncStorage. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (alive && raw) setValue(JSON.parse(raw) as T);
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [key]);

  // Don't write until the stored value has loaded, or the initial value would overwrite it.
  useEffect(() => {
    if (!ready) return;
    if (value === null || value === undefined) AsyncStorage.removeItem(key).catch(() => {});
    else AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, ready]);

  return [value, setValue] as const;
}
