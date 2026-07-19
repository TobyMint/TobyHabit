import { api } from './client'

export interface TreeInfo {
  stage: number
  stage_label: string
  health: 'excellent' | 'good' | 'okay' | 'wilting' | 'wilted'
  total_days: number
  effective_days: number
  current_streak: number
  longest_streak: number
  freeze_cards: number
  next_milestone: number | null
  days_to_next_milestone: number | null
}

export interface Habit {
  id: number
  name: string
  emoji: string
  description: string | null
  target_count_per_day: number
  mini_version_text: string | null
  color: string
  tree_species: string
  is_archived: boolean
  created_at: string
  updated_at: string
  today_count: number
  today_mini_count: number
  tree: TreeInfo | null
}

export interface HabitListItem {
  id: number
  name: string
  emoji: string
  color: string
  tree_species: string
  is_archived: boolean
  today_count: number
  target_count_per_day: number
  tree: TreeInfo | null
}

export interface HabitCreate {
  name: string
  emoji?: string
  description?: string | null
  target_count_per_day?: number
  mini_version_text?: string | null
  color?: string
  tree_species?: string
}

export interface HabitUpdate {
  name?: string
  emoji?: string
  description?: string | null
  target_count_per_day?: number
  mini_version_text?: string | null
  color?: string
  tree_species?: string
  is_archived?: boolean
}

export interface CheckInCreate {
  is_mini?: boolean
  note?: string | null
  mood?: number | null
}

export interface CheckInResponse {
  id: number
  habit_id: number
  date: string
  is_mini: boolean
  note: string | null
  mood: number | null
  created_at: string
}

export interface CheckInResult {
  checkin: CheckInResponse
  tree: TreeInfo
  milestone_reached: number[]
  streak_frozen: boolean
}

export interface Stats {
  total_habits: number
  active_habits: number
  total_checkins: number
  total_days_tracked: number
  best_streak: number
  best_streak_habit_name: string | null
  forest_health_pct: number
}

export interface JournalEntry {
  id: number
  habit_id: number
  habit_name: string
  habit_emoji: string
  date: string
  note: string
  mood: number | null
  is_mini: boolean
}

export interface JournalResponse {
  entries: JournalEntry[]
  total: number
}

export interface CalendarDay {
  date: string
  count: number
  is_mini: boolean
}

export interface CalendarResponse {
  days: CalendarDay[]
  start_date: string
  end_date: string
}

// API functions
export const habitsApi = {
  list: (includeArchived = false) =>
    api.get<HabitListItem[]>(`/habits?include_archived=${includeArchived}`),

  get: (id: number) => api.get<Habit>(`/habits/${id}`),

  create: (data: HabitCreate) => api.post<Habit>('/habits', data),

  update: (id: number, data: HabitUpdate) => api.patch<Habit>(`/habits/${id}`, data),

  archive: (id: number) => api.delete<{ ok: boolean }>(`/habits/${id}`),

  checkIn: (habitId: number, data: CheckInCreate = {}) =>
    api.post<CheckInResult>(`/habits/${habitId}/checkin`, data),

  getCheckIns: (habitId: number, limit = 60) =>
    api.get<CheckInResponse[]>(`/habits/${habitId}/checkins?limit=${limit}`),

  getCalendar: (habitId: number) =>
    api.get<CalendarResponse>(`/habits/${habitId}/calendar`),
}

export const statsApi = {
  get: () => api.get<Stats>('/stats'),

  getJournal: (habitId?: number, limit = 50, offset = 0) => {
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    params.set('offset', String(offset))
    if (habitId) params.set('habit_id', String(habitId))
    return api.get<JournalResponse>(`/journal?${params.toString()}`)
  },
}
