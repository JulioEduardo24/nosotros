import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Photo {
  id: string
  user_id: string
  image_url: string
  caption: string
  category: string
  created_at: string
  user: User
}

export interface Event {
  id: string
  user_id: string
  title: string
  description: string
  date: string
  time: string
  created_at: string
}

export interface User {
  id: string
  email: string
  username: string
  created_at: string
}