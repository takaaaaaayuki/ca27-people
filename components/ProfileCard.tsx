import Link from 'next/link'
import { Profile } from '@/lib/types'

type Props = {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <Link href={`/profile/${profile.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
        <div className="aspect-[4/3] bg-cream overflow-hidden">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{profile.name}</h3>
          {profile.interested_department && (
            <p className="text-sm text-gray-500 mb-3">{profile.interested_department}</p>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary/20 text-primary px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}