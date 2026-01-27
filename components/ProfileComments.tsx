'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProfileCommentWithAuthor } from '@/lib/types'

type ProfileCommentsProps = {
  profileId: string
  profileUserId: string
}

export default function ProfileComments({ profileId, profileUserId }: ProfileCommentsProps) {
  const [comments, setComments] = useState<ProfileCommentWithAuthor[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUserId(user.id)
    }
    fetchComments()
  }, [profileId])

  const fetchComments = async () => {
    setLoading(true)

    // コメントを取得
    const { data: commentsData, error: commentsError } = await supabase
      .from('profile_comments')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (commentsError) {
      console.error('Comments fetch error:', commentsError)
      setLoading(false)
      return
    }

    // 各コメントの作成者情報を取得
    const commentsWithAuthors = await Promise.all(
      (commentsData || []).map(async (comment) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, photo_url, user_id')
          .eq('user_id', comment.user_id)
          .single()

        return {
          ...comment,
          author: profileData ? {
            id: profileData.id,
            name: profileData.name,
            photo_url: profileData.photo_url
          } : null
        }
      })
    )

    // いいね数を取得
    const commentsWithLikes = await Promise.all(
      commentsWithAuthors.map(async (comment) => {
        const { count } = await supabase
          .from('profile_comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id)

        const { data: userLike } = await supabase
          .from('profile_comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', currentUserId || '')
          .maybeSingle()

        return {
          ...comment,
          like_count: count || 0,
          user_has_liked: !!userLike
        }
      })
    )

    setComments(commentsWithLikes as any)
    setLoading(false)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || !currentUserId) return

    setSubmitting(true)

    const { error } = await supabase
      .from('profile_comments')
      .insert({
        profile_id: profileId,
        user_id: currentUserId,
        content: commentInput.trim()
      })

    if (error) {
      alert('コメントの投稿に失敗しました')
      console.error(error)
    } else {
      setCommentInput('')
      await fetchComments()
    }

    setSubmitting(false)
  }

  const handleLikeComment = async (commentId: string, hasLiked: boolean) => {
    if (!currentUserId) {
      alert('ログインが必要です')
      return
    }

    try {
      if (hasLiked) {
        // いいね解除
        const { error } = await supabase
          .from('profile_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId)

        if (error) {
          console.error('いいね解除エラー:', error)
          alert('いいねの解除に失敗しました')
          return
        }
      } else {
        // いいね追加
        const { error } = await supabase
          .from('profile_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: currentUserId
          })

        if (error) {
          console.error('いいね追加エラー:', error)
          alert('いいねに失敗しました')
          return
        }
      }

      // 成功したら再読み込み
      await fetchComments()
    } catch (error) {
      console.error('いいね処理エラー:', error)
      alert('エラーが発生しました')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('コメントを削除しますか？')) return

    const { error } = await supabase
      .from('profile_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      alert('削除に失敗しました')
      console.error(error)
    } else {
      await fetchComments()
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-dark mb-6">コメント ({comments.length})</h2>

      {/* コメント入力フォーム */}
      {currentUserId && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!commentInput.trim() || submitting}
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-secondary transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">送信</span>
            </button>
          </div>
        </form>
      )}

      {/* コメント一覧 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">まだコメントがありません</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3 p-4 hover:bg-gray-50 rounded-lg transition">
              {/* プロフィール写真 */}
              <div className="w-10 h-10 rounded-full bg-cream overflow-hidden flex-shrink-0">
                {comment.author?.photo_url ? (
                  <img
                    src={comment.author.photo_url}
                    alt={comment.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* コメント内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-dark">{comment.author?.name || '不明'}</span>
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-dark text-sm break-words">{comment.content}</p>

                {/* いいね・削除ボタン */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleLikeComment(comment.id, comment.user_has_liked)}
                    className={`flex items-center gap-1 text-sm transition ${
                      comment.user_has_liked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                    disabled={!currentUserId}
                  >
                    <Heart
                      size={16}
                      fill={comment.user_has_liked ? 'currentColor' : 'none'}
                    />
                    {comment.like_count > 0 && <span>{comment.like_count}</span>}
                  </button>

                  {/* 削除ボタン（本人のみ） */}
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                      <span>削除</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}