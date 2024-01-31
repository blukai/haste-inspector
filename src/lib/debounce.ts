export type Cancelable = {
  clear(): void;
};

export function isCancelable<T extends object>(fn: T): fn is T & Cancelable {
  return "clear" in fn;
}

export function debounce<A extends any[]>(
  fn: (...args: A) => void,
  wait = 166,
) {
  let timeout: ReturnType<typeof setTimeout>;

  const debounced: typeof fn & Cancelable = (...args: A) => {
    const later = () => fn.apply(null, args);

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.clear = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
