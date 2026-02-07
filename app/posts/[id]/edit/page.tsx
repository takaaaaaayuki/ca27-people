'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Bold, Edit3, Eye, Image, Link as LinkIcon, List, Quote, Type } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatText } from '@/lib/textFormatter'
import { Post } from '@/lib/types'

type EditablePost = Pick<
  Post,
  'title' | 'content' | 'thumbnail_url' | 'external_url' | 'post_type' | 'is_official'
>

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined)

  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [originalPost, setOriginalPost] = useState<Post | null>(null)
  const [post, setPost] = useState<EditablePost>({
    title: '',
    content: '',
    thumbnail_url: '',
    external_url: '',
    post_type: 'blog',
    is_official: false,
  })

  const contentRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    if (!postId) return
    fetchPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  async function fetchPost() {
    setLoading(true)
    const { data: postData, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !postData) {
      setOriginalPost(null)
      setLoading(false)
      return
    }

    setOriginalPost(postData as Post)
    setPost({
      title: postData.title ?? '',
      content: postData.content ?? '',
      thumbnail_url: postData.thumbnail_url ?? '',
      external_url: postData.external_url ?? '',
      post_type: (postData.post_type ?? 'blog') as 'blog' | 'event' | 'news',
      is_official: !!postData.is_official,
    })
    setLoading(false)
  }

  const canEdit = (() => {
    if (!originalPost) return false
    if (isAdmin) return true
    if (!userId) return false
    return originalPost.user_id === userId
  })()

  // サムネイル画像アップロード
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!userId) return

    setUploadingThumbnail(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `thumbnail-${userId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file)

    if (uploadError) {
      alert('画像のアップロードに失敗しました')
      console.error(uploadError)
    } else {
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
      setPost((prev) => ({ ...prev, thumbnail_url: urlData.publicUrl }))
    }

    setUploadingThumbnail(false)
  }

  // 本文中の画像アップロード
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!userId) return

    setUploadingImage(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `content-${userId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file)

    if (uploadError) {
      alert('画像のアップロードに失敗しました')
      console.error(uploadError)
    } else {
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)

      // カーソル位置に画像マークダウンを挿入
      const imageMarkdown = `\n![画像](${urlData.publicUrl})\n`
      const textarea = contentRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = (post.content ?? '').slice(0, start) + imageMarkdown + (post.content ?? '').slice(end)
        setPost((prev) => ({ ...prev, content: newContent }))
      } else {
        setPost((prev) => ({ ...prev, content: (prev.content ?? '') + imageMarkdown }))
      }
    }

    setUploadingImage(false)
    e.target.value = ''
  }

  // ツールバーの装飾挿入
  const insertFormatting = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const currentContent = post.content ?? ''
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentContent.slice(start, end) || placeholder
    const newContent = currentContent.slice(0, start) + before + selectedText + after + currentContent.slice(end)
    setPost((prev) => ({ ...prev, content: newContent }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId || !originalPost) return
    if (!canEdit) {
      alert('この記事を編集する権限がありません')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('posts')
      .update({
        title: post.title,
        content: post.content || null,
        thumbnail_url: post.thumbnail_url || null,
        external_url: post.external_url || null,
        post_type: post.post_type,
        is_official: isAdmin ? post.is_official : originalPost.is_official,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      alert('更新に失敗しました')
      console.error(error)
    } else {
      alert('更新しました！')
      router.push(`/posts/${postId}`)
    }

    setSaving(false)
  }

  // マークダウンをHTMLに変換
  const renderMarkdown = (text: string) => {
    if (!text) return ''

    let html = text
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-dark mt-6 mb-2">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-dark mt-8 mb-3">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-dark mt-8 mb-4">$1</h1>')
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />')
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
    )
    html = formatText(html)
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-gray-600 italic">$1</blockquote>')
    html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    return html
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!originalPost || !postId) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-gray-400" />
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

  if (!canEdit) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-4">この記事を編集する権限がありません</p>
            <Link href={`/posts/${postId}`} className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-secondary transition">
              記事に戻る
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/posts/${postId}`} className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-2">
            <ArrowLeft size={18} />
            <span>戻る</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">記事を編集</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* サムネイル */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-dark mb-3">サムネイル画像</label>
            <div className="flex items-start gap-6">
              <div className="w-48 aspect-video bg-cream rounded-lg overflow-hidden flex-shrink-0">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt="サムネイル" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Image size={40} />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumbnail}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-secondary disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-2">{uploadingThumbnail ? 'アップロード中...' : '推奨: 16:9の画像'}</p>
                {post.thumbnail_url && (
                  <button
                    type="button"
                    onClick={() => setPost((prev) => ({ ...prev, thumbnail_url: '' }))}
                    className="text-xs text-red-500 mt-2 hover:underline"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* タイトル・タイプ */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">タイトル *</label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                placeholder="記事のタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">投稿タイプ</label>
              <div className="flex gap-3">
                {[
                  { key: 'blog', label: 'ブログ' },
                  { key: 'event', label: 'イベント' },
                  { key: 'news', label: 'お知らせ' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPost((prev) => ({ ...prev, post_type: item.key as 'blog' | 'event' | 'news' }))}
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

            {isAdmin && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={post.is_official}
                  onChange={(e) => setPost((prev) => ({ ...prev, is_official: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="font-medium text-dark">公式投稿として投稿</span>
              </label>
            )}
          </div>

          {/* 本文エディタ */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-dark">本文</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                {showPreview ? (
                  <>
                    <Edit3 size={16} /> 編集に戻る
                  </>
                ) : (
                  <>
                    <Eye size={16} /> プレビュー
                  </>
                )}
              </button>
            </div>

            {/* ツールバー */}
            {!showPreview && (
              <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => insertFormatting('# ', '', '見出し1')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 flex items-center gap-1"
                  title="見出し1"
                >
                  <Type size={14} /> H1
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '', '見出し2')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="見出し2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '', '見出し3')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="見出し3"
                >
                  H3
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'テキスト')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 font-bold flex items-center gap-1"
                  title="太字"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('==', '==', 'テキスト')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 text-red-500"
                  title="赤字"
                >
                  赤
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('__', '__', 'テキスト')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 underline"
                  title="下線"
                >
                  U
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '', 'リスト項目')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 flex items-center gap-1"
                  title="リスト"
                >
                  <List size={14} /> リスト
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ', '', '引用文')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 flex items-center gap-1"
                  title="引用"
                >
                  <Quote size={14} /> 引用
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](URL)', 'リンクテキスト')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 flex items-center gap-1"
                  title="リンク"
                >
                  <LinkIcon size={14} /> リンク
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <label className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-1">
                  <Image size={14} /> 画像
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {uploadingImage && <span className="text-sm text-gray-500">アップロード中...</span>}
              </div>
            )}

            {showPreview ? (
              <div className="min-h-[400px] p-4 border border-gray-200 rounded-lg bg-gray-50">
                {post.content ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
                ) : (
                  <p className="text-gray-400">本文がありません</p>
                )}
              </div>
            ) : (
              <textarea
                ref={contentRef}
                value={post.content ?? ''}
                onChange={(e) => setPost((prev) => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                placeholder="マークダウンで記事を書けます。"
              />
            )}
          </div>

          {/* 外部リンク（オプション） */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-dark mb-2">
              外部リンク（任意）
              <span className="text-gray-400 font-normal ml-2">noteなど外部記事へのリンク</span>
            </label>
            <input
              type="url"
              value={post.external_url ?? ''}
              onChange={(e) => setPost((prev) => ({ ...prev, external_url: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://note.com/..."
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition disabled:bg-gray-400"
            >
              {saving ? '更新中...' : '更新する'}
            </button>
            <Link
              href={`/posts/${postId}`}
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

