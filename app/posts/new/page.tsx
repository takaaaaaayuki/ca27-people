'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatText } from '@/lib/textFormatter'

export default function NewPostPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  
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

  // サムネイル画像アップロード
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `thumbnail-${userId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('画像のアップロードに失敗しました')
      console.error(uploadError)
    } else {
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)
      setPost({ ...post, thumbnail_url: urlData.publicUrl })
    }

    setUploadingThumbnail(false)
  }

  // 本文中の画像アップロード
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `content-${userId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('画像のアップロードに失敗しました')
      console.error(uploadError)
    } else {
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)
      
      // カーソル位置に画像マークダウンを挿入
      const imageMarkdown = `\n![画像](${urlData.publicUrl})\n`
      const textarea = contentRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = post.content.slice(0, start) + imageMarkdown + post.content.slice(end)
        setPost({ ...post, content: newContent })
      } else {
        setPost({ ...post, content: post.content + imageMarkdown })
      }
    }

    setUploadingImage(false)
    // input をリセット
    e.target.value = ''
  }

  // ツールバーの装飾挿入
  const insertFormatting = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = post.content.slice(start, end) || placeholder
    const newContent = post.content.slice(0, start) + before + selectedText + after + post.content.slice(end)
    setPost({ ...post, content: newContent })

    // カーソル位置を調整
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

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

  // マークダウンをHTMLに変換
  const renderMarkdown = (text: string) => {
    if (!text) return ''
    
    let html = text

    // 見出し
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-dark mt-6 mb-2">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-dark mt-8 mb-3">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-dark mt-8 mb-4">$1</h1>')

    // 画像
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />')

    // リンク
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')

    // 太字・赤字・下線（既存のformatTextを活用）
    html = formatText(html)

    // リスト
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')

    // 引用
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-gray-600 italic">$1</blockquote>')

    // 水平線
    html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')

    return html
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">記事を書く</h1>
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
                    <span className="text-4xl">🖼️</span>
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
                <p className="text-xs text-gray-400 mt-2">
                  {uploadingThumbnail ? 'アップロード中...' : '推奨: 16:9の画像'}
                </p>
                {post.thumbnail_url && (
                  <button
                    type="button"
                    onClick={() => setPost({ ...post, thumbnail_url: '' })}
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
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                placeholder="記事のタイトル"
              />
            </div>

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

            {isAdmin && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={post.is_official}
                  onChange={(e) => setPost({ ...post, is_official: e.target.checked })}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="font-medium text-dark">🏢 公式投稿として投稿</span>
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
                className="text-sm text-primary font-medium hover:underline"
              >
                {showPreview ? '✏️ 編集に戻る' : '👁️ プレビュー'}
              </button>
            </div>

            {/* ツールバー */}
            {!showPreview && (
              <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => insertFormatting('# ', '', '見出し1')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="見出し1"
                >
                  H1
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
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 font-bold"
                  title="太字"
                >
                  B
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
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="リスト"
                >
                  • リスト
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ', '', '引用文')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="引用"
                >
                  " 引用
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](URL)', 'リンクテキスト')}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100"
                  title="リンク"
                >
                  🔗 リンク
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <label className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-100 cursor-pointer">
                  📷 画像
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
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                  />
                ) : (
                  <p className="text-gray-400">本文がありません</p>
                )}
              </div>
            ) : (
              <textarea
                ref={contentRef}
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                placeholder="マークダウンで記事を書けます。

# 見出し1
## 見出し2
### 見出し3

**太字** ==赤字== __下線__

- リスト項目
- リスト項目

> 引用文

[リンクテキスト](https://example.com)

![画像の説明](画像URL)"
              />
            )}

            {/* 書き方ヘルプ */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">📝 書き方ヒント</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                <span><code className="bg-gray-200 px-1 rounded"># 見出し</code></span>
                <span><code className="bg-gray-200 px-1 rounded">**太字**</code></span>
                <span><code className="bg-gray-200 px-1 rounded">==赤字==</code></span>
                <span><code className="bg-gray-200 px-1 rounded">- リスト</code></span>
              </div>
            </div>
          </div>

          {/* 外部リンク（オプション） */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-dark mb-2">
              外部リンク（任意）
              <span className="text-gray-400 font-normal ml-2">noteなど外部記事へのリンク</span>
            </label>
            <input
              type="url"
              value={post.external_url}
              onChange={(e) => setPost({ ...post, external_url: e.target.value })}
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