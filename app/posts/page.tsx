'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PostWithAuthor } from '@/lib/types'
import NewsCard from '@/components/NewsCard'

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'official' | 'blog' | 'event' | 'news'>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      // ログインしていない場合
      setLoading(false)
      return
    }
    
    const user = JSON.parse(userStr)
    setUserId(user.id)
    
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')

    fetchPosts()
  }, [])

  // ログインしていない場合の表示
  if (!loading && !userId) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-2">ニュース</h1>
            <p className="text-white/80">CA27メンバーの投稿・お知らせ</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">ログインが必要です</h2>
            <p className="text-gray-500 mb-8">
              ニュースページはメンバー限定です。<br />
              ログインしてアクセスしてください。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-primary font-medium rounded-full border-2 border-primary hover:bg-primary/5 transition"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  async function fetchPosts() {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
      return
    }

    if (postsData && postsData.length > 0) {
      const userIds = postsData.map(p => p.user_id).filter(Boolean)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, name, photo_url')
        .in('user_id', userIds)

      const profilesMap: Record<string, { id: string; name: string; photo_url: string | null }> = {}
      profiles?.forEach(p => {
        profilesMap[p.user_id] = { id: p.id, name: p.name, photo_url: p.photo_url }
      })

      const postsWithAuthors = postsData.map(post => ({
        ...post,
        author: post.user_id ? profilesMap[post.user_id] || null : null
      }))

      setPosts(postsWithAuthors)
    }

    setLoading(false)
  }

  async function handleDelete(postId: string) {
    const confirmed = window.confirm('この記事を削除しますか？')
    if (!confirmed) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      alert('削除に失敗しました')
    } else {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    if (filter === 'official') return post.is_official
    return post.post_type === filter
  })

  const filters = [
    { key: 'all', label: 'すべて' },
    { key: 'official', label: '公式' },
    { key: 'blog', label: 'ブログ' },
    { key: 'event', label: 'イベント' },
    { key: 'news', label: 'お知らせ' },
  ]

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">ニュース</h1>
          <p className="text-white/80">CA27メンバーの投稿・お知らせ</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  filter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {userId && (
            <Link
              href="/posts/new"
              className="flex items-center gap-1 px-5 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
            >
              <Plus size={18} />
              <span>投稿する</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">投稿がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => {
              const canDelete = isAdmin || userId === post.user_id
              return (
                <div key={post.id} className="relative group">
                  <NewsCard post={post} />
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(post.id)
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white z-10"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}