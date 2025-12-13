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
  role: 'business' | 'engineer' | 'designer' | null
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  organizer: string | null
  created_by: string | null
  created_at: string
}

export type EventParticipant = {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export type ParticipantWithProfile = {
  id: string
  event_id: string
  user_id: string
  created_at: string
  profile: {
    name: string
    photo_url: string | null
  } | null
}

export type Post = {
  id: string
  user_id: string | null
  title: string
  content: string | null
  thumbnail_url: string | null
  external_url: string | null
  post_type: 'blog' | 'event' | 'news'
  is_official: boolean
  created_at: string
  updated_at: string
}

export type PostWithAuthor = Post & {
  author: {
    name: string
    photo_url: string | null
  } | null
}