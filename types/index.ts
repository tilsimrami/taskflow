export interface Profile {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface Board {
  id: string
  title: string
  user_id: string
  created_at: string
}

export interface Column {
  id: string
  title: string
  board_id: string
  position: number
  created_at: string
}

export interface Card {
  id: string
  title: string
  description: string | null
  column_id: string
  position: number
  created_at: string
}
