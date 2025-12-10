import Link from 'next/link'
import { Profile } from '@/lib/types'

type Props = {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <Link href={`/profile/${profile.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        <div className="aspect-square bg-gray-200">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900">{profile.name}</h3>
          {profile.interested_department && (
            <p className="text-sm text-gray-600 mt-1">
              {profile.interested_department}
            </p>
          )}
          {profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
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