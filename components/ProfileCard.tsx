import Link from 'next/link'
import { Profile } from '@/lib/types'

type Props = {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <Link href={`/profile/${profile.id}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* 写真 */}
        <div className="aspect-[4/3] bg-cream overflow-hidden">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-6xl opacity-50">👤</span>
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-dark mb-2">{profile.name}</h3>
          {profile.interested_departments && profile.interested_departments.length > 0 && (
            <div className="space-y-1">
              {profile.interested_departments.slice(0, 2).map((dept) => (
                <p key={dept} className="text-sm text-gray-500 line-clamp-1">
                  {dept}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}