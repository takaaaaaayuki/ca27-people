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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">読み込み中...</p>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-green-500 hover:underline mb-6 inline-block">
        ← 一覧に戻る
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-green-600 h-32"></div>
        
        <div className="px-8 pb-8">
          <div className="-mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              {profile.interested_department && (
                <p className="text-gray-600 mt-1">{profile.interested_department}</p>
              )}
            </div>
            {isOwner && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                編集する
              </Link>
            )}
          </div>

          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {profile.career && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">これまでの経歴</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.career}</p>
              </section>
            )}

            {profile.effort && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">人生で頑張ったこと</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.effort}</p>
              </section>
            )}

            {profile.goals && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">27卒でやりたいこと</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.goals}</p>
              </section>
            )}

            {profile.hobbies && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">ハマってる趣味</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.hobbies}</p>
              </section>
            )}

            {profile.reason_for_ca && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">CAに決めた理由</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.reason_for_ca}</p>
              </section>
            )}

            {profile.sns_links && Object.values(profile.sns_links).some(v => v) && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">SNS</h2>
                <div className="flex gap-4">
                  {profile.sns_links.twitter && (
                    <a href={profile.sns_links.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      X (Twitter)
                    </a>
                  )}
                  {profile.sns_links.instagram && (
                    <a href={profile.sns_links.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                      Instagram
                    </a>
                  )}
                  {profile.sns_links.github && (
                    <a href={profile.sns_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">
                      GitHub
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}