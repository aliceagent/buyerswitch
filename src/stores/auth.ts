"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DemoProfile, UiRole } from "@/types";

export const ALEX: DemoProfile = {
  id: "user-alex",
  displayName: "Alex Rivera",
  email: "alex.rivera@example.com",
  company: "Example Brands",
  createdAt: "2021-10-31T00:00:00.000Z",
};

export const JORDAN: DemoProfile = {
  id: "user-jordan",
  displayName: "Jordan Lee",
  email: "jordan.lee@example.com",
  company: "Example Brands",
  createdAt: "2021-10-31T00:00:00.000Z",
};

interface AuthState {
  version: number;
  profiles: DemoProfile[];
  selectedProfileId: string | null;
  roleByUser: Record<string, UiRole>;
  onboardingByUser: Record<string, { profile: boolean; workspace: boolean; explore: boolean }>;
  hydrateError: string | null;
  setSelected: (id: string | null) => void;
  upsertProfile: (p: DemoProfile) => void;
  setRole: (userId: string, role: UiRole) => void;
  markOnboarding: (userId: string, step: "profile" | "workspace" | "explore") => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      version: 2,
      profiles: [ALEX],
      selectedProfileId: null,
      roleByUser: { "user-alex": "admin" },
      onboardingByUser: { "user-alex": { profile: true, workspace: true, explore: true } },
      hydrateError: null,
      setSelected: (id) => set({ selectedProfileId: id }),
      upsertProfile: (p) =>
        set({
          profiles: [...get().profiles.filter((x) => x.id !== p.id), p],
        }),
      setRole: (userId, role) => set({ roleByUser: { ...get().roleByUser, [userId]: role } }),
      markOnboarding: (userId, step) => {
        const cur = get().onboardingByUser[userId] ?? { profile: false, workspace: false, explore: false };
        set({ onboardingByUser: { ...get().onboardingByUser, [userId]: { ...cur, [step]: true } } });
      },
      signOut: () => set({ selectedProfileId: null }),
    }),
    {
      name: "bs.auth",
      version: 2,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
