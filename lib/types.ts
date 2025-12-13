export type User = {
  id: string
  email: string
  created_at: string
}

export type Profile = {
  id: string
  user_id: string
  name: string
  photo_url: string | null
  career: string | null
  effort: string | null
  goals: string | null
  interested_departments: string[] | null
  hobbies: string | null
  reason_for_ca: string | null
  sns_links: {
    twitter?: string
    instagram?: string
    github?: string
    facebook?: string
  }
  tags: string[]
  created_at: string
  updated_at: string
}