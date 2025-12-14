'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Post, CommentWithAuthor } from '@/lib/types'
import { formatText } from '@/lib/textFormatter'

type PostWithAuthor = Post & {
  author: {
    id: string
    name: string
    photo_url: string | null
  } | null
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostWithAuthor | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    }
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')
    fetchPost()
  }, [params.id])

  async function fetchPost() {
    const { data: postData, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !postData) {
      setLoading(false)
      return
    }

    let author = null
    if (postData.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, user_id, name, photo_url')
        .eq('user_id', postData.user_id)
        .single()

      if (profileData) {
        author = {
          id: profileData.id,
          name: profileData.name,
          photo_url: profileData.photo_url,
        }
      }
    }

    setPost({ ...postData, author })
    await fetchLikes(postData.id)
    await fetchComments(postData.id)
    setLoading(false)
  }

  async function fetchLikes(postId: string) {
    const { data: likes, count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)

    setLikeCount(count || 0)

    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      const myLike = likes?.find(like => like.user_id === user.id)
      setIsLiked(!!myLike)
    }
  }

  async function fetchComments(postId: string) {
    const { data: commentsData } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsData && commentsData.length > 0) {
      const userIds = commentsData.map(c => c.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, name, photo_url')
        .in('user_id', userIds)

      const profilesMap: Record<string, { id: string; name: string; photo_url: string | null }> = {}
      profiles?.forEach(p => {
        profilesMap[p.user_id] = { id: p.id, name: p.name, photo_url: p.photo_url }
      })

      const commentsWithAuthors = commentsData.map(comment => ({
        ...comment,
        author: profilesMap[comment.user_id] || null
      }))

      setComments(commentsWithAuthors)
    } else {
      setComments([])
    }
  }

  async function handleLike() {
    if (!userId || !post) return
    setLikeLoading(true)

    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', userId)
      
      setIsLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      await supabase
        .from('post_likes')
        .insert([{ post_id: post.id, user_id: userId }])
      
      setIsLiked(true)
      setLikeCount(prev => prev + 1)

      if (post.user_id && post.user_id !== userId) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: post.user_id,
            type: 'like',
            title: 'いいねされました',
            message: `あなたの投稿「${post.title}」にいいねがつきました`,
            link: `/posts/${post.id}`,
            related_user_id: userId,
            related_post_id: post.id,
          }])
      }
    }

    setLikeLoading(false)
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !post || !newComment.trim()) return
    
    setCommentLoading(true)

    const { error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: post.id,
        user_id: userId,
        content: newComment.trim()
      }])

    if (error) {
      alert('コメントの投稿に失敗しました')
    } else {
      if (post.user_id && post.user_id !== userId) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: post.user_id,
            type: 'comment',
            title: 'コメントがつきました',
            message: `あなたの投稿「${post.title}」にコメントがつきました`,
            link: `/posts/${post.id}`,
            related_user_id: userId,
            related_post_id: post.id,
          }])
      }

      setNewComment('')
      await fetchComments(post.id)
    }

    setCommentLoading(false)
  }

  async function handleDeleteComment(commentId: string) {
    const confirmed = window.confirm('このコメントを削除しますか？')
    if (!confirmed) return

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      alert('削除に失敗しました')
    } else {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  async function handleDeletePost() {
    if (!post) return
    const confirmed = window.confirm('この記事を削除しますか？')
    if (!confirmed) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (error) {
      alert('削除に失敗しました')
    } else {
      router.push('/posts')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatCommentDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getTypeLabel = (type: string, isOfficial: boolean) => {
    if (isOfficial) return { label: '公式', color: 'bg-primary text-white' }
    switch (type) {
      case 'event':
        return { label: 'イベント', color: 'bg-orange-500 text-white' }
      case 'news':
        return { label: 'お知らせ', color: 'bg-blue-500 text-white' }
      default:
        return { label: 'ブログ', color: 'bg-gray-500 text-white' }
    }
  }

  const renderMarkdown = (text: string) => {
    if (!text) return ''
    let html = text
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-dark mt-6 mb-2">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-dark mt-8 mb-3">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-dark mt-8 mb-4">$1</h1>')
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />')
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-secondary">$1</a>')
    html = formatText(html)
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-gray-600 italic">$1</blockquote>')
    html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    return html
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😢</span>
            </div>
            <p className="text-gray-600 text-lg mb-4">記事が見つかりませんでした</p>
            <Link href="/posts" className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-secondary transition">
              記事一覧に戻る
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const typeInfo = getTypeLabel(post.post_type, post.is_official)
  const canDeletePost = isAdmin || userId === post.user_id

  return (
    <main className="min-h-screen bg-cream">
      {post.thumbnail_url && (
        <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
          <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/posts" className="inline-block text-primary hover:underline mb-6">
          ← 記事一覧に戻る
        </Link>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
            </div>

            <h1 className="text-3xl font-bold text-dark mb-6">{post.title}</h1>

            {post.author && (
              <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 mb-6 hover:opacity-80 transition">
                <div className="w-12 h-12 rounded-full bg-cream overflow-hidden">
                  {post.author.photo_url ? (
                    <img src={post.author.photo_url} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">👤</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-dark">{post.author.name}</p>
                  <p className="text-xs text-gray-500">投稿者</p>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <button
                onClick={handleLike}
                disabled={!userId || likeLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                <span>いいね</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{likeCount}</span>
              </button>
              {!userId && <span className="text-sm text-gray-400">ログインするといいねできます</span>}
            </div>

            {post.content && (
              <div className="prose max-w-none text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
            )}

            {post.external_url && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">🔗 関連リンク</p>
                <a href={post.external_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                  {post.external_url}
                </a>
              </div>
            )}
          </div>

          {canDeletePost && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={handleDeletePost} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition">
                この記事を削除
              </button>
            </div>
          )}
        </article>

        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-dark">💬 コメント ({comments.length})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {comments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">まだコメントはありません</div>
            ) : (
              comments.map((comment) => {
                const canDeleteComment = isAdmin || userId === comment.user_id || userId === post.user_id
                return (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-start gap-3">
                      {comment.author ? (
                        <Link href={`/profile/${comment.author.id}`} className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-cream overflow-hidden">
                            {comment.author.photo_url ? (
                              <img src={comment.author.photo_url} alt={comment.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">👤</div>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-gray-300">👤</div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-dark">{comment.author?.name || '不明'}</span>
                          <span className="text-xs text-gray-400">{formatCommentDate(comment.created_at)}</span>
                        </div>
                        <p className="text-dark whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      {canDeleteComment && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500 transition text-sm" title="削除">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {userId ? (
            <form onSubmit={handleSubmitComment} className="p-6 bg-gray-50 border-t border-gray-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを入力..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {commentLoading ? '送信中...' : 'コメントする'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-gray-500 mb-3">コメントするにはログインが必要です</p>
              <Link href="/login" className="text-primary hover:underline font-medium">ログインする →</Link>
            </div>
          )}
        </div>

        <div className="h-16"></div>
      </div>
    </main>
  )
}