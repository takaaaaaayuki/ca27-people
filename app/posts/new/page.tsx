'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewPostPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState({
    title: '',
    content: '',
    thumbnail_url: '',
    external_url: '',
    post_type: 'blog' as 'blog' | 'event' | 'news',
    is_official: false,
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setUserId(user.id)

    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('posts')
      .insert([{
        user_id: userId,
        title: post.title,
        content: post.content || null,
        thumbnail_url: post.thumbnail_url || null,
        external_url: post.external_url || null,
        post_type: post.post_type,
        is_official: isAdmin ? post.is_official : false,
      }])

    if (error) {
      alert('投稿に失敗しました')
      console.error(error)
    } else {
      alert('投稿しました！')
      router.push('/posts')
    }

    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">記事を投稿</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="space-y-4">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">タイトル *</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="記事のタイトル"
                />
              </div>

              {/* 投稿タイプ */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">投稿タイプ</label>
                <div className="flex gap-3">
                  {[
                    { key: 'blog', label: '📝 ブログ' },
                    { key: 'event', label: '🎉 イベント' },
                    { key: 'news', label: '📢 お知らせ' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPost({ ...post, post_type: item.key as 'blog' | 'event' | 'news' })}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition font-medium ${
                        post.post_type === item.key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 管理者のみ：公式投稿 */}
              {isAdmin && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={post.is_official}
                      onChange={(e) => setPost({ ...post, is_official: e.target.checked })}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="font-medium text-dark">🏢 公式投稿として投稿</span>
                  </label>
                </div>
              )}

              {/* 説明・本文 */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">説明・本文</label>
                <textarea
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="記事の概要や内容"
                />
              </div>

              {/* 外部リンク */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">外部リンク（note, ブログなど）</label>
                <input
                  type="url"
                  value={post.external_url}
                  onChange={(e) => setPost({ ...post, external_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://note.com/..."
                />
              </div>

              {/* サムネイル */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">サムネイル画像URL</label>
                <input
                  type="url"
                  value={post.thumbnail_url}
                  onChange={(e) => setPost({ ...post, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://..."
                />
                {post.thumbnail_url && (
                  <div className="mt-2">
                    <img
                      src={post.thumbnail_url}
                      alt="サムネイルプレビュー"
                      className="w-full max-w-xs h-auto rounded-lg"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition disabled:bg-gray-400"
            >
              {saving ? '投稿中...' : '投稿する'}
            </button>
            <Link
              href="/posts"
              className="px-8 py-4 bg-white text-dark font-medium rounded-lg hover:bg-gray-100 transition shadow-sm text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}