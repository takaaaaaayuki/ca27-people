'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PostWithAuthor } from '@/lib/types'
import NewsCard from '@/components/NewsCard'

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'blog' | 'event' | 'news' | 'official'>('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
      setIsLoggedIn(true)
    }
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')
    
    fetchPosts()
  }, [])

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
      const userIds = postsData.filter(p => p.user_id).map(p => p.user_id)
      let profilesMap: Record<string, { name: string; photo_url: string | null }> = {}
      
      if (userIds.length > 0) {
        const { data: authorProfiles } = await supabase
          .from('profiles')
          .select('user_id, name, photo_url')
          .in('user_id', userIds)
        
        if (authorProfiles) {
          authorProfiles.forEach(p => {
            profilesMap[p.user_id] = { name: p.name, photo_url: p.photo_url }
          })
        }
      }

      const postsWithAuthors = postsData.map(post => ({
        ...post,
        author: post.user_id ? profilesMap[post.user_id] || null : null
      }))

      setPosts(postsWithAuthors)
    }

    setLoading(false)
  }

  async function handleDelete(postId: string, postTitle: string) {
    const confirmed = window.confirm(`「${postTitle}」を削除しますか？`)
    if (!confirmed) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      alert('削除に失敗しました')
      console.error(error)
    } else {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    if (filter === 'official') return post.is_official
    return post.post_type === filter && !post.is_official
  })

  return (
    <main className="min-h-screen bg-cream">
      {/* ヒーロー */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">📰 ニュース & ブログ</h1>
          <p className="text-white/90">27卒の仲間たちの活動・お知らせ</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 投稿ボタン */}
        {isLoggedIn && (
          <div className="mb-6 text-right">
            <Link
              href="/posts/new"
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
            >
              ＋ 記事を投稿
            </Link>
          </div>
        )}

        {/* フィルター */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'official', label: '🏢 公式' },
            { key: 'blog', label: '📝 ブログ' },
            { key: 'event', label: '🎉 イベント' },
            { key: 'news', label: '📢 お知らせ' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as typeof filter)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                filter === item.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-gray-600 text-lg mb-2">まだ投稿がありません</p>
            {isLoggedIn && (
              <Link
                href="/posts/new"
                className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-secondary transition"
              >
                最初の記事を投稿する
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-50">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative group">
                <NewsCard post={post} />
                {/* 削除ボタン（管理者または投稿者のみ） */}
                {(isAdmin || userId === post.user_id) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(post.id, post.title)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-10"
                    title="削除"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}