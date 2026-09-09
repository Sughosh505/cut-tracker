export type CutStatus = 'ACTIVE' | 'COMPLETED'
export type DayStatus = 'GREEN' | 'RED'
export type WeightUnit = 'kg' | 'lbs'

export type Cut = {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  starting_weight: number | null
  target_weight: number | null
  calorie_target: number | null
  protein_target: number | null
  rules: string | null
  planned_end_date: string | null
  status: CutStatus
  created_at: string
  updated_at: string
}

export type DailyEntry = {
  id: string
  user_id: string
  cut_id: string
  date: string
  status: DayStatus
  weight: number | null
  calories: number | null
  protein: number | null
  training: boolean | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Preferences = {
  id: string
  user_id: string
  weight_unit: WeightUnit
  created_at: string
  updated_at: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: string
  }
  public: {
    Tables: {
      cuts: {
        Row: Cut
        Insert: Pick<Cut, 'user_id' | 'start_date'> &
          Partial<
            Pick<
              Cut,
              | 'end_date'
              | 'starting_weight'
              | 'target_weight'
              | 'calorie_target'
              | 'protein_target'
              | 'rules'
              | 'planned_end_date'
              | 'status'
            >
          >
        Update: Partial<Omit<Cut, 'id' | 'user_id'>>
        Relationships: []
      }
      daily_entries: {
        Row: DailyEntry
        Insert: Pick<DailyEntry, 'user_id' | 'cut_id' | 'date' | 'status'> &
          Partial<Pick<DailyEntry, 'weight' | 'calories' | 'protein' | 'training' | 'notes'>>
        Update: Partial<Omit<DailyEntry, 'id' | 'user_id' | 'cut_id'>>
        Relationships: []
      }
      preferences: {
        Row: Preferences
        Insert: Pick<Preferences, 'user_id'> & Partial<Pick<Preferences, 'weight_unit'>>
        Update: Partial<Omit<Preferences, 'id' | 'user_id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
