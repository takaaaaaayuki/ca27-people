import Link from 'next/link'
import { PostWithAuthor } from '@/lib/types'

type Props = {
  post: PostWithAuthor
}

export default function NewsCard({ post }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
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

  const typeInfo = getTypeLabel(post.post_type, post.is_official)

  const CardContent = () => (
    <div className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
      {/* サムネイル */}
      <div className="aspect-[16/9] bg-cream overflow-hidden relative">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-4xl">📝</span>
          </div>
        )}
        {/* タイプバッジ */}
        <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{formatDate(post.created_at)}</p>
        <h3 className="font-bold text-dark text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.content && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.content}</p>
        )}
        {post.author && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cream overflow-hidden">
              {post.author.photo_url ? (
                <img src={post.author.photo_url} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">👤</div>
              )}
            </div>
            <span className="text-xs text-gray-500">{post.author.name}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (post.external_url) {
    return (
      <a href={post.external_url} target="_blank" rel="noopener noreferrer">
        <CardContent />
      </a>
    )
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <CardContent />
    </Link>
  )
}