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
    <main className="min-h-screen bg-cream">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">CA27 People</h1>
          <p className="text-white/90 text-lg">27卒の仲間たちを紹介するサイト</p>
        </div>
      </div>

      {/* 検索結果件数 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <p className="text-gray-600">
          検索結果: <span className="text-3xl font-bold text-primary">{profiles.length}</span> 件
        </p>
      </div>

      {/* プロフィール一覧 */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">読み込み中...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <p className="text-gray-500 mb-2">まだプロフィールが登録されていません</p>
            <p className="text-gray-400 text-sm">新規登録してプロフィールを作成しましょう！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}