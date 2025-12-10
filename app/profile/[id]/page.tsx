'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

export default function ProfileDetail() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setProfile(data)

      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setIsOwner(user.id === data.user_id)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [params.id, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500 text-lg font-body">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const hasSnsLinks = profile.sns_links && 
    (profile.sns_links.twitter || profile.sns_links.instagram || profile.sns_links.github)

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-br from-primary via-primary to-secondary h-56"></div>

      <div className="max-w-4xl mx-auto px-4 -mt-40">
        <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-body transition-colors">
          <span>←</span>
          <span>一覧に戻る</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-44 h-44 rounded-2xl bg-cream overflow-hidden flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-300">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                  👤
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  {profile.interested_department && (
                    <p className="text-primary font-body font-medium mb-2 text-lg">{profile.interested_department}</p>
                  )}
                  <h1 className="text-4xl md:text-5xl font-display text-dark mb-4">{profile.name}</h1>
                </div>
                {isOwner && (
                  <Link
                    href="/profile/edit"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300 font-body font-medium"
                  >
                    編集する
                  </Link>
                )}
              </div>

              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full text-sm font-body font-medium border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="p-8 md:p-10 space-y-10">
            {profile.career && (
              <section className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  これまでの経歴
                </h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap font-body pl-5">{profile.career}</p>
              </section>
            )}

            {profile.effort && (
              <section className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  人生で頑張ったこと
                </h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap font-body pl-5">{profile.effort}</p>
              </section>
            )}

            {profile.goals && (
              <section className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  27卒でやりたいこと
                </h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap font-body pl-5">{profile.goals}</p>
              </section>
            )}

            {profile.hobbies && (
              <section className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  ハマってる趣味
                </h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap font-body pl-5">{profile.hobbies}</p>
              </section>
            )}

            {profile.reason_for_ca && (
              <section className="animate-fadeIn" style={{ animationDelay: '500ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  CAに決めた理由
                </h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap font-body pl-5">{profile.reason_for_ca}</p>
              </section>
            )}

            {hasSnsLinks && (
              <section className="animate-fadeIn" style={{ animationDelay: '600ms' }}>
                <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  SNS
                </h2>
                <div className="flex gap-4 pl-5">
                  {profile.sns_links?.twitter && (
                    <a href={profile.sns_links.twitter} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-cream rounded-full text-dark hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 font-body font-medium">
                      X (Twitter)
                    </a>
                  )}
                  {profile.sns_links?.instagram && (
                    <a href={profile.sns_links.instagram} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-cream rounded-full text-dark hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 font-body font-medium">
                      Instagram
                    </a>
                  )}
                  {profile.sns_links?.github && (
                    <a href={profile.sns_links.github} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-cream rounded-full text-dark hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 font-body font-medium">
                      GitHub
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="h-16"></div>
      </div>
    </main>
  )
}