'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import ProfileCard from '@/components/ProfileCard'

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles:', error)
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CA27 People</h1>
        <p className="mt-2 text-gray-600">27卒の仲間たちを紹介するサイト</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">まだプロフィールが登録されていません</p>
          <p className="text-gray-400 mt-2">新規登録してプロフィールを作成しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </main>
  )
}