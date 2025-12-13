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
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const hasSnsLinks = profile.sns_links && 
    (profile.sns_links.twitter || profile.sns_links.instagram || profile.sns_links.github || profile.sns_links.facebook)

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary h-48"></div>

      <div className="max-w-4xl mx-auto px-4 -mt-32">
        <Link href="/" className="inline-block text-white hover:underline mb-6">
          ← 一覧に戻る
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-40 h-40 rounded-xl bg-cream overflow-hidden flex-shrink-0 shadow-md">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                  👤
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  {profile.interested_departments && profile.interested_departments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.interested_departments.map((dept) => (
                        <span key={dept} className="text-primary font-medium text-sm bg-primary/10 px-3 py-1 rounded-full">
                          {dept}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-dark mb-4">{profile.name}</h1>
                </div>
                {isOwner && (
                  <Link
                    href="/profile/edit"
                    className="px-5 py-2 bg-primary text-white rounded-full hover:bg-secondary transition"
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
                      className="px-4 py-1 bg-secondary/20 text-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="p-8 space-y-8">
            {profile.career && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ これまでの経歴</h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap">{profile.career}</p>
              </div>
            )}

            {profile.effort && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ 人生で頑張ったこと</h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap">{profile.effort}</p>
              </div>
            )}

            {profile.goals && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ 27卒でやりたいこと</h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap">{profile.goals}</p>
              </div>
            )}

            {profile.hobbies && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ ハマってる趣味</h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap">{profile.hobbies}</p>
              </div>
            )}

            {profile.reason_for_ca && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ CAに決めた理由</h2>
                <p className="text-dark leading-relaxed whitespace-pre-wrap">{profile.reason_for_ca}</p>
              </div>
            )}

            {hasSnsLinks && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ SNS</h2>
                <div className="flex flex-wrap gap-4">
                  {profile.sns_links?.twitter && (
                    <a href={profile.sns_links.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      X (Twitter)
                    </a>
                  )}
                  {profile.sns_links?.instagram && (
                    <a href={profile.sns_links.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      Instagram
                    </a>
                  )}
                  {profile.sns_links?.facebook && (
                    <a href={profile.sns_links.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      Facebook
                    </a>
                  )}
                  {profile.sns_links?.github && (
                    <a href={profile.sns_links.github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-16"></div>
      </div>
    </main>
  )
}