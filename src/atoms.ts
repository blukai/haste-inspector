import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type WrappedParser } from "./lib/haste";

// https://jotai.org/docs/recipes/atom-with-toggle-and-storage
function atomWithToggleAndStorage(
  key: string,
  initialValue?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage?: any,
) {
  const anAtom = atomWithStorage(key, initialValue, storage);
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(anAtom);
      set(anAtom, update);
    },
  );
  return derivedAtom;
}

export const darkModeAtom = atomWithToggleAndStorage("darkMode");
export const fullWidthAtom = atomWithToggleAndStorage("fullWidth");

export const demFileAtom = atom<File | undefined>(undefined);
export const demParserAtom = atom<WrappedParser | undefined>(undefined);
export const demTickAtom = atom(0);
export const demSelectedEntityIndexAtom = atom<number | undefined>(undefined);
