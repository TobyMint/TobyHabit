import { create } from 'zustand'
import { habitsApi, statsApi, type HabitListItem, type Habit, type Stats } from '../api/habits'

interface HabitStore {
  habits: HabitListItem[]
  stats: Stats | null
  loading: boolean
  error: string | null

  fetchHabits: () => Promise<void>
  fetchStats: () => Promise<void>
  getHabit: (id: number) => Promise<Habit>
  createHabit: (data: Parameters<typeof habitsApi.create>[0]) => Promise<Habit>
  checkIn: (habitId: number, isMini?: boolean, note?: string, mood?: number) => Promise<any>
  archiveHabit: (id: number) => Promise<void>
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  stats: null,
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const habits = await habitsApi.list()
      set({ habits, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const stats = await statsApi.get()
      set({ stats })
    } catch (e: any) {
      // non-critical
    }
  },

  getHabit: async (id: number) => {
    return habitsApi.get(id)
  },

  createHabit: async (data) => {
    const habit = await habitsApi.create(data)
    await get().fetchHabits()
    return habit
  },

  checkIn: async (habitId, isMini = false, note, mood) => {
    const result = await habitsApi.checkIn(habitId, {
      is_mini: isMini,
      note: note || null,
      mood: mood || null,
    })
    // Refresh data after check-in
    await Promise.all([get().fetchHabits(), get().fetchStats()])
    return result
  },

  archiveHabit: async (id) => {
    await habitsApi.archive(id)
    await get().fetchHabits()
  },
}))
