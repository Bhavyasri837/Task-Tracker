import { useState, useEffect } from 'react';

// Delays updating a value until the user has stopped changing it for `delay` ms.
// Used to avoid firing a search API request on every keystroke.
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
