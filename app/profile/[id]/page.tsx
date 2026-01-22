'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, ArrowLeft, Edit3, Twitter, Instagram, Facebook, Github, Globe, Building2, Hash, Cake, QrCode } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile, PostWithAuthor } from '@/lib/types'
import { formatText } from '@/lib/textFormatter'
import { MBTI_TYPES } from '@/lib/constants'
import NewsCard from '@/components/NewsCard'
import QRCodeModal from '@/components/QRCodeModal'

export default function ProfileDetail() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (profileError || !profileData) {
        router.push('/')
        return
      }

      setProfile(profileData)

      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setIsOwner(user.id === profileData.user_id)
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (postsData) {
        const postsWithAuthor = postsData.map(post => ({
          ...post,
          author: {
            name: profileData.name,
            photo_url: profileData.photo_url
          }
        }))
        setPosts(postsWithAuthor)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id, router])

  const renderContent = (text: string) => {
    if (!text) return ''
    let html = text
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />')
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-dark mt-4 mb-1">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-dark mt-4 mb-2">$1</h2>')
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    html = formatText(html)
    return html
  }

  const formatBirthday = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // プロフィールURLを取得
  const getProfileUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const hasSnsLinks = profile.sns_links && 
    (profile.sns_links.twitter || profile.sns_links.instagram || profile.sns_links.github || profile.sns_links.facebook || profile.sns_links.other)

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary h-48"></div>

      <div className="max-w-4xl mx-auto px-4 -mt-32">
        <Link href="/" className="inline-flex items-center gap-1 text-white hover:underline mb-6">
          <ArrowLeft size={18} />
          <span>一覧に戻る</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* ヘッダー部分：写真・名前・MBTI */}
          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-40 h-40 rounded-xl bg-cream overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={60} className="text-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  {/* 名前 */}
                  <h1 className="text-3xl font-bold text-dark">{profile.name}</h1>
                  
                  {/* ローマ字名 */}
                  {profile.name_romaji && (
                    <p className="text-gray-500 text-sm mt-1">{profile.name_romaji}</p>
                  )}
                  
                  {/* あだ名・誕生日 */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {profile.nickname && (
                      <span className="text-primary font-medium">「{profile.nickname}」</span>
                    )}
                    {profile.birthday && (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Cake size={16} />
                        {formatBirthday(profile.birthday)}
                      </span>
                    )}
                  </div>
                  
                  {/* MBTI */}
                  {profile.mbti && MBTI_TYPES[profile.mbti as keyof typeof MBTI_TYPES] && (
                    <span className={`inline-block px-3 py-1 ${MBTI_TYPES[profile.mbti as keyof typeof MBTI_TYPES].color} rounded-full text-sm font-medium mt-3`}>
                      {MBTI_TYPES[profile.mbti as keyof typeof MBTI_TYPES].label}
                    </span>
                  )}
                </div>
                
                {/* ボタン群 */}
                <div className="flex gap-2">
                  {/* QRコードボタン */}
                  <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-primary border-2 border-primary rounded-full hover:bg-primary/5 transition"
                    title="QRコードで共有"
                  >
                    <QrCode size={18} />
                    <span className="hidden sm:inline">QRコード</span>
                  </button>
                  
                  {/* 編集ボタン（本人のみ） */}
                  {isOwner && (
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-1 px-5 py-2 bg-primary text-white rounded-full hover:bg-secondary transition"
                    >
                      <Edit3 size={16} />
                      <span>編集する</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 興味のある事業部セクション（上部） */}
          {profile.interested_departments && profile.interested_departments.length > 0 && (
            <div className="px-8 pb-6">
              <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <Building2 size={16} />
                興味のある事業部
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interested_departments.map((dept) => (
                  <span key={dept} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>

          {/* 自己紹介セクション */}
          <div className="p-8 space-y-8">
            {profile.career && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ これまでの経歴</h2>
                <div 
                  className="text-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(profile.career) }}
                />
              </div>
            )}

            {profile.effort && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ 人生で頑張ったこと</h2>
                <div 
                  className="text-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(profile.effort) }}
                />
              </div>
            )}

            {profile.goals && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ 同期でやりたいこと</h2>
                <div 
                  className="text-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(profile.goals) }}
                />
              </div>
            )}

            {profile.hobbies && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ ハマってる趣味</h2>
                <div 
                  className="text-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(profile.hobbies) }}
                />
              </div>
            )}

            {profile.reason_for_ca && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ CAに決めた理由</h2>
                <div 
                  className="text-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(profile.reason_for_ca) }}
                />
              </div>
            )}

            {/* 自由タグセクション（SNSの上） */}
            {profile.tags && profile.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <Hash size={20} />
                  タグ
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-secondary/20 text-primary rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SNSセクション（最後） */}
            {hasSnsLinks && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-3">■ SNS</h2>
                <div className="flex flex-wrap gap-4">
                  {profile.sns_links?.twitter && (
                    <a href={profile.sns_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      <Twitter size={18} />
                      <span>X (Twitter)</span>
                    </a>
                  )}
                  {profile.sns_links?.instagram && (
                    <a href={profile.sns_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      <Instagram size={18} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {profile.sns_links?.facebook && (
                    <a href={profile.sns_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      <Facebook size={18} />
                      <span>Facebook</span>
                    </a>
                  )}
                  {profile.sns_links?.github && (
                    <a href={profile.sns_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      <Github size={18} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.sns_links?.other && (
                    <a href={profile.sns_links.other} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-dark hover:bg-secondary/20 transition">
                      <Globe size={18} />
                      <span>その他</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {posts.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-dark">{profile.name}さんの投稿</h2>
              <Link href={`/posts?user=${profile.user_id}`} className="text-primary text-sm font-medium hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {isOwner && posts.length === 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-500 mb-4">まだ投稿がありません</p>
            <Link
              href="/posts/new"
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
            >
              記事を投稿する
            </Link>
          </div>
        )}

        <div className="h-16"></div>
      </div>

      {/* QRコードモーダル */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={getProfileUrl()}
        userName={profile.name}
      />
    </main>
  )
}