import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DisplayPreferences {
  distanceUnit: "kilometers" | "miles";
  refreshInterval: number;
  textSize: "small" | "normal" | "large";
}

interface DataDisplayStore extends DisplayPreferences {
  setPreference: <K extends keyof DisplayPreferences>(key: K, value: DisplayPreferences[K]) => void;
}

export const TEXT_SIZE_PX: Record<DisplayPreferences["textSize"], string> = {
  small: "14px",
  normal: "16px",
  large: "18px",
};

export const useDataDisplayStore = create<DataDisplayStore>()(
  persist(
    (set) => ({
      distanceUnit: "kilometers",
      refreshInterval: 5,
      textSize: "normal",
      setPreference: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: "data-display-preferences",
    }
  )
);
