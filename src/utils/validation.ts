export type Errors<T> = Partial<Record<keyof T, string>>;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPhone = (v: string) => /^[+\d][\d\s()-]{6,}$/.test(v);

export const required = (v: string, name: string) => (v.trim() ? undefined : `${name} is required`);

export const passwordRules = (v: string) => {
  if (v.length < 8) return 'Use at least 8 characters';
  if (!/[A-Z]/.test(v)) return 'Add an uppercase letter';
  if (!/[0-9]/.test(v)) return 'Add a number';
  return undefined;
};

export const clean = <T extends object>(e: Errors<T>): Errors<T> =>
  Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Errors<T>;
