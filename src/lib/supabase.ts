import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://nxglkfsmhoruxficwvfd.supabase.co'
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z2xrZnNtaG9ydXhmaWN3dmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODM0NDgsImV4cCI6MjA3MDM1OTQ0OH0.VNheMcfW-5hsftzkPfbcbKfS3QLaifraRxGcap4ziHg'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Question {
  id: string
  text: string
  type: 'text' | 'multiple_choice' | 'yes_no' | 'special'
  options?: string[]
  required: boolean
  order: number
}

export interface Response {
  id?: string
  session_id: string
  question_id: string
  answer: string
  created_at?: string
}

export interface QuestionnaireSession {
  id?: string
  created_at?: string
  completed: boolean
  final_answer?: string
}