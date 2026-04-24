import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLoginStore = create(
  persist(
    (set) => ({
      step: 1,
      email: '',
      outlet: null,
      kasir: null,
      setStep: (step) => set({ step }),
      setEmail: (email) => set({ email }),
      setOutlet: (outlet) => set({ outlet }),
      setKasir: (kasir) => set({ kasir }),
      reset: () => set({ step: 1, email: '', outlet: null, kasir: null }),
    }),
    { name: 'lunomi-login' }
  )
)