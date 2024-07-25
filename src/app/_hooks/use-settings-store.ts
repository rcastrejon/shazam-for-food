import type { PersistStorage } from "zustand/middleware";
import Cookies from "universal-cookie";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { availableLanguageTags } from "~/paraglide/runtime";

const cookies = new Cookies(null, {
  path: "/",
  sameSite: "lax",
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
});

const storageSchema = z.object({
  NEXT_LOCALE: z.enum(availableLanguageTags).optional(),
  "X-API-KEY": z.string().optional(),
});

type StorageSchema = z.infer<typeof storageSchema>;

const storage: PersistStorage<StorageSchema> = {
  getItem: (_) => {
    const allCookies = cookies.getAll({ doNotParse: true }) as unknown;
    const result = storageSchema.safeParse(allCookies);
    if (result.success) {
      return { state: result.data };
    }
    return null;
  },
  setItem: (_, value) => {
    const { state } = value;
    Object.entries(state).forEach(([k, v]) => {
      cookies.set(k, v);
    });
  },
  removeItem: (_) => {
    Object.keys(storageSchema.shape).forEach((key) => {
      cookies.remove(key);
    });
  },
};

export const useSettingsStore = create<StorageSchema>()(
  persist(
    (_) => ({
      NEXT_LOCALE: undefined,
      "X-API-KEY": undefined,
    }),
    {
      name: "settings-storage", // useless in our implementation of a cookie storage
      storage: storage,
    },
  ),
);

export const setSettings = (settings: StorageSchema) =>
  useSettingsStore.setState(settings);
