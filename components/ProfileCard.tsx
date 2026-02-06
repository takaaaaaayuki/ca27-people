import Link from 'next/link'
import { User } from 'lucide-react'
import { Profile } from '@/lib/types'

type Props = {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <Link
      href={`/profile/${profile.id}`}
      id={`profile-${profile.id}`}
      className="block scroll-mt-28"
    >
      <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="aspect-[4/3] bg-cream overflow-hidden">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
              <User size={60} className="opacity-50" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-dark mb-2">{profile.name}</h3>
          
          {/* タグ表示（最大3個） */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 bg-secondary/20 text-primary rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {profile.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-gray-400 text-xs">
                  +{profile.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}