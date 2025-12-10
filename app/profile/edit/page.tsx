'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: '',
    photo_url: '',
    career: '',
    effort: '',
    goals: '',
    interested_department: '',
    hobbies: '',
    reason_for_ca: '',
    sns_links: {},
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userStr)
    setUserId(user.id)

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        if (data.photo_url) {
          setPreviewUrl(data.photo_url)
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !profile.tags?.includes(tagInput.trim())) {
      setProfile({
        ...profile,
        tags: [...(profile.tags || []), tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setProfile({
      ...profile,
      tags: profile.tags?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let photoUrl = profile.photo_url

      // 画像をアップロード
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        }
      }

      // プロフィールを更新
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          photo_url: photoUrl,
          career: profile.career,
          effort: profile.effort,
          goals: profile.goals,
          interested_department: profile.interested_department,
          hobbies: profile.hobbies,
          reason_for_ca: profile.reason_for_ca,
          sns_links: profile.sns_links,
          tags: profile.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Update error:', error)
        alert('保存に失敗しました')
      } else {
        alert('保存しました！')
        router.push('/')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('エラーが発生しました')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">読み込み中...</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">プロフィール編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 写真 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プロフィール写真
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500"
            />
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">基本情報</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 *
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              興味のある事業部
            </label>
            <input
              type="text"
              value={profile.interested_department || ''}
              onChange={(e) =>
                setProfile({ ...profile, interested_department: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: AbemaTV, Cygames, AI事業本部"
            />
          </div>
        </div>

        {/* 自己紹介 */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">自己紹介</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              これまでの経歴（学校・サークル・部活）
            </label>
            <textarea
              value={profile.career || ''}
              onChange={(e) => setProfile({ ...profile, career: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 〇〇大学 △△学部 / テニスサークル所属"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              人生で頑張ったこと
            </label>
            <textarea
              value={profile.effort || ''}
              onChange={(e) => setProfile({ ...profile, effort: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              27卒でやりたいこと
            </label>
            <textarea
              value={profile.goals || ''}
              onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ハマってる趣味
            </label>
            <textarea
              value={profile.hobbies || ''}
              onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CAに決めた理由
            </label>
            <textarea
              value={profile.reason_for_ca || ''}
              onChange={(e) =>
                setProfile({ ...profile, reason_for_ca: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* SNSリンク */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">SNSリンク</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X (Twitter)
            </label>
            <input
              type="url"
              value={profile.sns_links?.twitter || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  sns_links: { ...profile.sns_links, twitter: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://x.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              type="url"
              value={profile.sns_links?.instagram || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  sns_links: { ...profile.sns_links, instagram: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://instagram.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub
            </label>
            <input
              type="url"
              value={profile.sns_links?.github || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  sns_links: { ...profile.sns_links, github: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://github.com/username"
            />
          </div>
        </div>

        {/* タグ */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">自分を表すタグ</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="タグを入力してEnterまたは追加ボタン"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-green-500 hover:text-green-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  )
}