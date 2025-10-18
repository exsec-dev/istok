import { useEffect, useState } from "react";

const key = "documentCount";

export function useSessionCount() {
  const [value, setValue] = useState<number>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, String(value));
    } catch {}
  }, [value]);

  return [value, setValue] as const;
}
