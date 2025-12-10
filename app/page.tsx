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
      <div className="relative bg-gradient-to-br from-primary via-primary to-secondary py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-secondary/30 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-display text-white mb-6 tracking-tight">
            CA27 People
          </h1>
          <p className="text-white/90 text-xl md:text-2xl font-body tracking-wide">
            27卒の仲間たちを紹介するサイト
          </p>
          <div className="mt-8 w-24 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* 検索結果件数 */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-baseline gap-3">
          <span className="text-gray-500 text-lg font-body">検索結果:</span>
          <span className="text-6xl font-display text-primary">{profiles.length}</span>
          <span className="text-gray-500 text-lg font-body">件</span>
        </div>
      </div>

      {/* プロフィール一覧 */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500 text-lg font-body">読み込み中...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">👥</span>
            </div>
            <p className="text-gray-600 text-xl mb-2 font-display">まだプロフィールが登録されていません</p>
            <p className="text-gray-400 font-body">新規登録してプロフィールを作成しましょう！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}