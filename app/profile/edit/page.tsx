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
      const { data } = await supabase
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

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile)

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        }
      }

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
        alert('保存に失敗しました')
      } else {
        alert('保存しました！')
        router.push('/')
      }
    } catch (err) {
      alert('エラーが発生しました')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">プロフィール編集</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 写真 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">プロフィール写真</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-cream overflow-hidden shadow-md">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                    👤
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-secondary"
                />
                <p className="text-xs text-gray-400 mt-2">JPG, PNG形式（推奨: 正方形の画像）</p>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">名前 *</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">興味のある事業部</label>
                <input
                  type="text"
                  value={profile.interested_department || ''}
                  onChange={(e) => setProfile({ ...profile, interested_department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: AbemaTV, Cygames, AI事業本部"
                />
              </div>
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">自己紹介</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">これまでの経歴（学校・サークル・部活）</label>
                <textarea
                  value={profile.career || ''}
                  onChange={(e) => setProfile({ ...profile, career: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: 〇〇大学 △△学部 / テニスサークル所属"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">人生で頑張ったこと</label>
                <textarea
                  value={profile.effort || ''}
                  onChange={(e) => setProfile({ ...profile, effort: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">27卒でやりたいこと</label>
                <textarea
                  value={profile.goals || ''}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">ハマってる趣味</label>
                <textarea
                  value={profile.hobbies || ''}
                  onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">CAに決めた理由</label>
                <textarea
                  value={profile.reason_for_ca || ''}
                  onChange={(e) => setProfile({ ...profile, reason_for_ca: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* SNSリンク */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">SNSリンク</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">X (Twitter)</label>
                <input
                  type="url"
                  value={profile.sns_links?.twitter || ''}
                  onChange={(e) => setProfile({ ...profile, sns_links: { ...profile.sns_links, twitter: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://x.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Instagram</label>
                <input
                  type="url"
                  value={profile.sns_links?.instagram || ''}
                  onChange={(e) => setProfile({ ...profile, sns_links: { ...profile.sns_links, instagram: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">GitHub</label>
                <input
                  type="url"
                  value={profile.sns_links?.github || ''}
                  onChange={(e) => setProfile({ ...profile, sns_links: { ...profile.sns_links, github: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          {/* タグ */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">自分を表すタグ</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="タグを入力してEnter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-cream text-primary font-medium rounded-lg hover:bg-secondary/20 transition"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 text-primary rounded-full">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-primary/60 hover:text-primary">
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
              className="flex-1 py-4 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-white text-dark font-medium rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}