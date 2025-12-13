'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile, User } from '@/lib/types'

type UserWithProfile = User & {
  profile: Profile | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'profiles'>('users')

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  async function fetchData() {
    // ユーザー一覧取得
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      setLoading(false)
      return
    }

    // プロフィール一覧取得
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')

    // ユーザーとプロフィールを結合
    const usersWithProfiles = (usersData || []).map(user => ({
      ...user,
      profile: profilesData?.find(p => p.user_id === user.id) || null
    }))

    setUsers(usersWithProfiles)
    setLoading(false)
  }

  async function handleDeleteUser(userId: string, userName: string) {
    const confirmed = window.confirm(`「${userName}」のアカウントを削除しますか？\n※プロフィールも一緒に削除されます`)
    
    if (!confirmed) return

    // プロフィール削除
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    // イベント参加履歴削除
    await supabase
      .from('event_participants')
      .delete()
      .eq('user_id', userId)

    // ユーザー削除
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      alert('削除に失敗しました')
      console.error('Delete error:', error)
    } else {
      alert('削除しました')
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">管理者ダッシュボード</h1>
            <p className="text-white/80 text-sm mt-1">アカウント・プロフィール管理</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">総アカウント数</p>
            <p className="text-4xl font-bold text-primary mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">プロフィール作成済み</p>
            <p className="text-4xl font-bold text-secondary mt-2">
              {users.filter(u => u.profile && u.profile.name !== 'New Member').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">未設定</p>
            <p className="text-4xl font-bold text-gray-400 mt-2">
              {users.filter(u => !u.profile || u.profile.name === 'New Member').length}
            </p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'users'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            👤 アカウント一覧
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'profiles'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 プロフィール一覧
          </button>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'users' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">アイコン</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">名前</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">メールアドレス</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">登録日</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ステータス</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-cream overflow-hidden">
                        {user.profile?.photo_url ? (
                          <img
                            src={user.profile.photo_url}
                            alt={user.profile.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            👤
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.profile?.name || '未設定'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4">
                      {user.profile && user.profile.name !== 'New Member' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          設定済み
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          未設定
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.profile && (
                          <Link
                            href={`/profile/${user.profile.id}`}
                            className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-secondary transition"
                          >
                            表示
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.profile?.name || user.email)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">写真</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">名前</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">興味のある事業部</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">タグ</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.filter(u => u.profile).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full bg-cream overflow-hidden">
                        {user.profile?.photo_url ? (
                          <img
                            src={user.profile.photo_url}
                            alt={user.profile.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            👤
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.profile?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {user.profile?.interested_departments && user.profile.interested_departments.length > 0
                        ? user.profile.interested_departments.slice(0, 2).join(', ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.profile?.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/profile/${user.profile?.id}`}
                        className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-secondary transition"
                      >
                        詳細を見る
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {users.length === 0 && (
            <p className="text-center py-8 text-gray-500">アカウントがありません</p>
          )}
        </div>
      </div>
    </main>
  )
}