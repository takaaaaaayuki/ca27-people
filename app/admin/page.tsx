'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchProfiles()
  }, [router])

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(profileId: string, profileName: string) {
    const confirmed = window.confirm(`「${profileName}」のプロフィールを削除しますか？`)
    
    if (!confirmed) return

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (error) {
      alert('削除に失敗しました')
      console.error('Delete error:', error)
    } else {
      alert('削除しました')
      setProfiles(profiles.filter(p => p.id !== profileId))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">読み込み中...</p>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          ログアウト
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">写真</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">名前</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">興味のある事業部</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">登録日</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {profile.photo_url ? (
                      <img
                        src={profile.photo_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{profile.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {profile.interested_departments && profile.interested_departments.length > 0 
                    ? profile.interested_departments.join(', ') 
                    : '-'}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(profile.id, profile.name)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {profiles.length === 0 && (
          <p className="text-center py-8 text-gray-500">プロフィールがありません</p>
        )}
      </div>
    </main>
  )
}