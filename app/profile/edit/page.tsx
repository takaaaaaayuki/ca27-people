'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bold, Type, List, Image, Eye, Edit3, X, ChevronDown, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { DEPARTMENT_OPTIONS, ROLES, MBTI_TYPES } from '@/lib/constants'
import { formatText } from '@/lib/textFormatter'

function RichTextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  onImageUpload,
  uploadingImage = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingImage?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)

  const insertFormatting = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end) || placeholder
    const newContent = value.slice(0, start) + before + selectedText + after + value.slice(end)
    onChange(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const renderPreview = (text: string) => {
    if (!text) return ''
    let html = text
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-dark mt-4 mb-1">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-dark mt-4 mb-2">$1</h2>')
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-2 rounded-lg max-w-full" />')
    html = formatText(html)
    return html
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-dark">{label}</label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {showPreview ? <><Edit3 size={14} /> 編集</> : <><Eye size={14} /> プレビュー</>}
        </button>
      </div>

      {!showPreview && (
        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded-lg">
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', '見出し')}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 flex items-center gap-1"
          >
            <Type size={14} />
            見出し
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'テキスト')}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 font-bold flex items-center gap-1"
          >
            <Bold size={14} />
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('==', '==', 'テキスト')}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 text-red-500"
          >
            赤
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('__', '__', 'テキスト')}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', 'リスト')}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 flex items-center gap-1"
          >
            <List size={14} />
            リスト
          </button>
          {onImageUpload && (
            <label className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 cursor-pointer flex items-center gap-1">
              <Image size={14} />
              画像
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          )}
          {uploadingImage && <span className="text-xs text-gray-500">アップロード中...</span>}
        </div>
      )}

      {showPreview ? (
        <div className="min-h-[100px] p-4 border border-gray-200 rounded-lg bg-gray-50">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: renderPreview(value) }} />
          ) : (
            <p className="text-gray-400">内容がありません</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: '',
    name_romaji: '',
    nickname: '',
    birthday: null,
    photo_url: '',
    career: '',
    effort: '',
    goals: '',
    interested_departments: [],
    hobbies: '',
    reason_for_ca: '',
    sns_links: {},
    tags: [],
    role: 'business',
    mbti: null,
  })
  const [tagInput, setTagInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeptSelector, setShowDeptSelector] = useState(false)
  const [showMbtiSelector, setShowMbtiSelector] = useState(false)

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
          role: data.role || 'business',
          mbti: data.mbti || null,
          name_romaji: data.name_romaji || '',
          nickname: data.nickname || '',
          birthday: data.birthday || null,
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

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'career' | 'effort' | 'goals' | 'hobbies' | 'reason_for_ca'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploadingImage(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `profile-${userId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('画像のアップロードに失敗しました')
      console.error(uploadError)
    } else {
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)
      
      const imageMarkdown = `\n![画像](${urlData.publicUrl})\n`
      setProfile({
        ...profile,
        [field]: (profile[field] || '') + imageMarkdown
      })
    }

    setUploadingImage(false)
    e.target.value = ''
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
          name_romaji: profile.name_romaji || null,
          nickname: profile.nickname || null,
          birthday: profile.birthday || null,
          photo_url: photoUrl,
          career: profile.career,
          effort: profile.effort,
          goals: profile.goals,
          interested_departments: profile.interested_departments,
          hobbies: profile.hobbies,
          reason_for_ca: profile.reason_for_ca,
          sns_links: profile.sns_links,
          tags: profile.tags,
          role: profile.role,
          mbti: profile.mbti,
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

  const mbtiGroups = Object.entries(MBTI_TYPES).reduce((acc, [key, value]) => {
    if (!acc[value.group]) acc[value.group] = []
    acc[value.group].push({ key, ...value })
    return acc
  }, {} as Record<string, Array<{ key: string; label: string; group: string; color: string }>>)

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">プロフィール編集</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">プロフィール写真</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-cream overflow-hidden shadow-md flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 text-3xl">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
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
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">名前（ローマ字）</label>
                <input
                  type="text"
                  value={profile.name_romaji || ''}
                  onChange={(e) => setProfile({ ...profile, name_romaji: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: Taro Yamada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">あだ名</label>
                <input
                  type="text"
                  value={profile.nickname || ''}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: たろー"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">誕生日</label>
                <input
                  type="date"
                  value={profile.birthday || ''}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">職種 *</label>
                <div className="flex gap-3">
                  {Object.entries(ROLES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProfile({ ...profile, role: key as 'business' | 'engineer' | 'designer' })}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition font-medium ${
                        profile.role === key
                          ? `${value.bgLight} ${value.textColor} border-current`
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">MBTI</label>
                
                {profile.mbti && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 ${MBTI_TYPES[profile.mbti as keyof typeof MBTI_TYPES]?.color || 'bg-gray-100'} rounded-full text-sm font-medium`}>
                      {MBTI_TYPES[profile.mbti as keyof typeof MBTI_TYPES]?.label || profile.mbti}
                      <button type="button" onClick={() => setProfile({ ...profile, mbti: null })} className="text-gray-500 hover:text-gray-700">
                        <X size={14} />
                      </button>
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowMbtiSelector(!showMbtiSelector)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-primary transition flex items-center justify-between"
                >
                  <span>{showMbtiSelector ? '閉じる' : 'MBTIを選択...'}</span>
                  <ChevronDown size={18} className={`transition-transform ${showMbtiSelector ? 'rotate-180' : ''}`} />
                </button>

                {showMbtiSelector && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    {Object.entries(mbtiGroups).map(([group, types]) => (
                      <div key={group} className="border-b border-gray-100 last:border-b-0">
                        <div className={`px-4 py-2 font-bold text-sm ${types[0].color}`}>
                          {group}
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {types.map((type) => (
                            <button
                              key={type.key}
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, mbti: type.key })
                                setShowMbtiSelector(false)
                              }}
                              className={`px-3 py-2 text-left rounded-lg text-sm hover:bg-gray-50 transition ${
                                profile.mbti === type.key ? 'bg-primary/10 text-primary font-medium' : ''
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-2">興味のある事業部（複数選択可）</label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(profile.interested_departments || []).map((dept) => (
                    <span key={dept} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {dept}
                      <button type="button" onClick={() => handleRemoveDept(dept)} className="text-primary/60 hover:text-primary">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeptSelector(!showDeptSelector)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-primary transition flex items-center justify-between"
                >
                  <span>{showDeptSelector ? '閉じる' : '事業部を選択...'}</span>
                  <ChevronDown size={18} className={`transition-transform ${showDeptSelector ? 'rotate-180' : ''}`} />
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

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">自己紹介</h2>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Image size={14} />
              <span>ボタンで画像を追加できます</span>
            </p>
            <div className="space-y-6">
              <RichTextArea
                label="これまでの経歴（学校・サークル・部活）"
                value={profile.career || ''}
                onChange={(value) => setProfile({ ...profile, career: value })}
                placeholder="例: 〇〇大学 △△学部 / テニスサークル所属"
                onImageUpload={(e) => handleContentImageUpload(e, 'career')}
                uploadingImage={uploadingImage}
              />

              <RichTextArea
                label="人生で頑張ったこと"
                value={profile.effort || ''}
                onChange={(value) => setProfile({ ...profile, effort: value })}
                onImageUpload={(e) => handleContentImageUpload(e, 'effort')}
                uploadingImage={uploadingImage}
              />

              <RichTextArea
                label="同期でやりたいこと"
                value={profile.goals || ''}
                onChange={(value) => setProfile({ ...profile, goals: value })}
                onImageUpload={(e) => handleContentImageUpload(e, 'goals')}
                uploadingImage={uploadingImage}
              />

              <RichTextArea
                label="ハマってる趣味"
                value={profile.hobbies || ''}
                onChange={(value) => setProfile({ ...profile, hobbies: value })}
                rows={3}
                onImageUpload={(e) => handleContentImageUpload(e, 'hobbies')}
                uploadingImage={uploadingImage}
              />

              <RichTextArea
                label="CAに決めた理由"
                value={profile.reason_for_ca || ''}
                onChange={(value) => setProfile({ ...profile, reason_for_ca: value })}
                onImageUpload={(e) => handleContentImageUpload(e, 'reason_for_ca')}
                uploadingImage={uploadingImage}
              />
            </div>
          </div>

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
              <div>
                <label className="block text-sm font-medium text-dark mb-2">その他（ブログ、ポートフォリオなど）</label>
                <input
                  type="url"
                  value={profile.sns_links?.other || ''}
                  onChange={(e) => setProfile({ ...profile, sns_links: { ...profile.sns_links, other: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

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
                className="px-6 py-3 bg-cream text-primary font-medium rounded-lg hover:bg-secondary/20 transition flex items-center gap-1"
              >
                <Plus size={18} />
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 text-primary rounded-full">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-primary/60 hover:text-primary">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

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