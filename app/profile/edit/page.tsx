'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { DEPARTMENT_OPTIONS } from '@/lib/constants'
import { formatText } from '@/lib/textFormatter'

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
    interested_departments: [],
    hobbies: '',
    reason_for_ca: '',
    sns_links: {},
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeptSelector, setShowDeptSelector] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [previewField, setPreviewField] = useState<string | null>(null)

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
        setProfile({
          ...data,
          interested_departments: data.interested_departments || [],
        })
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

  const handleDeptToggle = (dept: string) => {
    const current = profile.interested_departments || []
    if (current.includes(dept)) {
      setProfile({
        ...profile,
        interested_departments: current.filter(d => d !== dept),
      })
    } else {
      setProfile({
        ...profile,
        interested_departments: [...current, dept],
      })
    }
  }

  const handleRemoveDept = (dept: string) => {
    setProfile({
      ...profile,
      interested_departments: (profile.interested_departments || []).filter(d => d !== dept),
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
          interested_departments: profile.interested_departments,
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
        {/* 装飾ヘルプ */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex justify-between items-center text-left"
          >
            <span className="font-bold text-primary">✨ テキスト装飾の使い方</span>
            <span className="text-gray-400">{showHelp ? '▲' : '▼'}</span>
          </button>
          {showHelp && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <code className="bg-gray-200 px-2 py-1 rounded">**テキスト**</code>
                <span>→</span>
                <strong className="font-bold">太字になります</strong>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <code className="bg-gray-200 px-2 py-1 rounded">==テキスト==</code>
                <span>→</span>
                <span className="text-red-500 font-medium">赤字になります</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <code className="bg-gray-200 px-2 py-1 rounded">__テキスト__</code>
                <span>→</span>
                <u>下線がつきます</u>
              </div>
              {/* <p className="text-gray-500 text-xs mt-2">
                ※ 組み合わせもOK: **==太字で赤字==**
              </p> */}
            </div>
          )}
        </div>

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
              
              {/* 興味のある事業部（複数選択） */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">興味のある事業部（複数選択可）</label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(profile.interested_departments || []).map((dept) => (
                    <span key={dept} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {dept}
                      <button type="button" onClick={() => handleRemoveDept(dept)} className="text-primary/60 hover:text-primary">
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeptSelector(!showDeptSelector)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-primary transition"
                >
                  {showDeptSelector ? '閉じる' : '事業部を選択...'}
                </button>

                {showDeptSelector && (
                  <div className="mt-3 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {Object.entries(DEPARTMENT_OPTIONS).map(([category, divisions]) => (
                      <div key={category} className="border-b border-gray-100 last:border-b-0">
                        <div className="px-4 py-2 bg-gray-50 font-bold text-dark text-sm">
                          {category}
                        </div>
                        {Object.entries(divisions).map(([division, departments]) => (
                          <div key={division}>
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(profile.interested_departments || []).includes(division)}
                                onChange={() => handleDeptToggle(division)}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                              />
                              <span className="font-medium text-dark">{division}</span>
                            </label>
                            {departments.length > 0 && (
                              <div className="pl-8">
                                {departments.map((dept: string) => (
                                  <label key={dept} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={(profile.interested_departments || []).includes(dept)}
                                      onChange={() => handleDeptToggle(dept)}
                                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-600">{dept}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">自己紹介</h2>
            <div className="space-y-4">
              {/* 経歴 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark">これまでの経歴（学校・サークル・部活）</label>
                  <button
                    type="button"
                    onClick={() => setPreviewField(previewField === 'career' ? null : 'career')}
                    className="text-xs text-primary hover:underline"
                  >
                    {previewField === 'career' ? 'プレビューを閉じる' : 'プレビュー'}
                  </button>
                </div>
                <textarea
                  value={profile.career || ''}
                  onChange={(e) => setProfile({ ...profile, career: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: 〇〇大学 △△学部 / テニスサークル所属"
                />
                {previewField === 'career' && profile.career && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                    <div className="text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(profile.career) }} />
                  </div>
                )}
              </div>

              {/* 頑張ったこと */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark">人生で頑張ったこと</label>
                  <button
                    type="button"
                    onClick={() => setPreviewField(previewField === 'effort' ? null : 'effort')}
                    className="text-xs text-primary hover:underline"
                  >
                    {previewField === 'effort' ? 'プレビューを閉じる' : 'プレビュー'}
                  </button>
                </div>
                <textarea
                  value={profile.effort || ''}
                  onChange={(e) => setProfile({ ...profile, effort: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {previewField === 'effort' && profile.effort && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                    <div className="text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(profile.effort) }} />
                  </div>
                )}
              </div>

              {/* やりたいこと */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark">27卒でやりたいこと</label>
                  <button
                    type="button"
                    onClick={() => setPreviewField(previewField === 'goals' ? null : 'goals')}
                    className="text-xs text-primary hover:underline"
                  >
                    {previewField === 'goals' ? 'プレビューを閉じる' : 'プレビュー'}
                  </button>
                </div>
                <textarea
                  value={profile.goals || ''}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {previewField === 'goals' && profile.goals && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                    <div className="text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(profile.goals) }} />
                  </div>
                )}
              </div>

              {/* 趣味 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark">ハマってる趣味</label>
                  <button
                    type="button"
                    onClick={() => setPreviewField(previewField === 'hobbies' ? null : 'hobbies')}
                    className="text-xs text-primary hover:underline"
                  >
                    {previewField === 'hobbies' ? 'プレビューを閉じる' : 'プレビュー'}
                  </button>
                </div>
                <textarea
                  value={profile.hobbies || ''}
                  onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {previewField === 'hobbies' && profile.hobbies && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                    <div className="text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(profile.hobbies) }} />
                  </div>
                )}
              </div>

              {/* CAに決めた理由 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark">CAに決めた理由</label>
                  <button
                    type="button"
                    onClick={() => setPreviewField(previewField === 'reason_for_ca' ? null : 'reason_for_ca')}
                    className="text-xs text-primary hover:underline"
                  >
                    {previewField === 'reason_for_ca' ? 'プレビューを閉じる' : 'プレビュー'}
                  </button>
                </div>
                <textarea
                  value={profile.reason_for_ca || ''}
                  onChange={(e) => setProfile({ ...profile, reason_for_ca: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {previewField === 'reason_for_ca' && profile.reason_for_ca && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                    <div className="text-dark leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(profile.reason_for_ca) }} />
                  </div>
                )}
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
                <label className="block text-sm font-medium text-dark mb-2">Facebook</label>
                <input
                  type="url"
                  value={profile.sns_links?.facebook || ''}
                  onChange={(e) => setProfile({ ...profile, sns_links: { ...profile.sns_links, facebook: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://facebook.com/username"
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