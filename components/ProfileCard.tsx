import Link from 'next/link'
import { Profile } from '@/lib/types'
import { ROLES } from '@/lib/constants'

type Props = {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  const role = profile.role || 'business'
  const roleInfo = ROLES[role as keyof typeof ROLES]

  return (
    <Link href={`/profile/${profile.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2">
        <div className="aspect-[4/3] bg-cream overflow-hidden relative">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-6xl opacity-50">👤</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* 職種バッジ */}
          <div className={`absolute top-3 left-3 px-3 py-1 ${roleInfo.color} text-white text-xs font-bold rounded-full`}>
            {roleInfo.label}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-xl text-dark mb-1 tracking-wide">{profile.name}</h3>
          {profile.interested_departments && profile.interested_departments.length > 0 && (
            <p className="text-sm text-gray-500 mb-3 font-medium line-clamp-1">
              {profile.interested_departments.slice(0, 2).join(', ')}
              {profile.interested_departments.length > 2 && ' ...'}
            </p>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </Link>
  )
}