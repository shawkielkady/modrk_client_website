import { useEffect, useState } from "react";

export default function useCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());

  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const isExpired = remaining === 0;

  useEffect(() => {
    if (isExpired) return;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isExpired]);

  return { remaining, isExpired };
}
