'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Building2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile, PostWithAuthor } from '@/lib/types'
import ProfileCard from '@/components/ProfileCard'
import NewsCard from '@/components/NewsCard'
import { DEPARTMENT_OPTIONS, ROLES, RoleKey } from '@/lib/constants'

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedRole, setSelectedRole] = useState<RoleKey | ''>('')
  const [showDeptFilter, setShowDeptFilter] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // プロフィール取得
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    } else {
      setProfiles(profilesData || [])
      setFilteredProfiles(profilesData || [])
    }

    // 投稿取得（最新5件）
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (postsError) {
      console.error('Error fetching posts:', postsError)
    } else if (postsData && postsData.length > 0) {
      // 投稿者のプロフィール情報を取得
      const userIds = postsData.filter(p => p.user_id).map(p => p.user_id)
      let profilesMap: Record<string, { name: string; photo_url: string | null }> = {}
      
      if (userIds.length > 0) {
        const { data: authorProfiles } = await supabase
          .from('profiles')
          .select('user_id, name, photo_url')
          .in('user_id', userIds)
        
        if (authorProfiles) {
          authorProfiles.forEach(p => {
            profilesMap[p.user_id] = { name: p.name, photo_url: p.photo_url }
          })
        }
      }

      const postsWithAuthors = postsData.map(post => ({
        ...post,
        author: post.user_id ? profilesMap[post.user_id] || null : null
      }))

      setPosts(postsWithAuthors)
    }

    setLoading(false)
  }

  // 検索・フィルター処理
  useEffect(() => {
    let result = profiles

    if (searchText) {
      const lowerSearch = searchText.toLowerCase()
      result = result.filter(profile => {
        const nameMatch = profile.name?.toLowerCase().includes(lowerSearch)
        const tagMatch = profile.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
        return nameMatch || tagMatch
      })
    }

    if (selectedDepartment) {
      result = result.filter(profile => {
        return profile.interested_departments?.includes(selectedDepartment)
      })
    }

    if (selectedRole) {
      result = result.filter(profile => profile.role === selectedRole)
    }

    setFilteredProfiles(result)
  }, [searchText, selectedDepartment, selectedRole, profiles])

  const clearFilters = () => {
    setSearchText('')
    setSelectedDepartment('')
    setSelectedRole('')
  }

  const roleCounts = {
    business: profiles.filter(p => p.role === 'business' || !p.role).length,
    engineer: profiles.filter(p => p.role === 'engineer').length,
    designer: profiles.filter(p => p.role === 'designer').length,
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* ヒーローセクション */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-secondary py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            CA27 People
          </h1>
          <p className="text-white/90 text-lg md:text-xl">
            27卒の仲間たちを紹介するサイト
          </p>
        </div>
      </div>

      {/* ニュースセクション */}
      {posts.length > 0 && (
        <div className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-dark">ニュース & ブログ</h2>
              <Link href="/posts" className="text-primary text-sm font-medium hover:underline">
                すべて見る →
              </Link>
            </div>
            
            {/* 横スクロール */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {posts.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 検索セクション */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          {/* 職種タブ */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedRole('')}
              className={`px-5 py-2.5 rounded-full font-medium transition ${
                selectedRole === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              すべて ({profiles.length})
            </button>
            {Object.entries(ROLES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key as RoleKey)}
                className={`px-5 py-2.5 rounded-full font-medium transition ${
                  selectedRole === key
                    ? `${value.color} text-white`
                    : `${value.bgLight} ${value.textColor} hover:opacity-80`
                }`}
              >
                {value.label} ({roleCounts[key as RoleKey]})
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* テキスト検索 */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="名前やタグで検索..."
                className="w-full pl-12 pr-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* 事業部フィルター */}
            <div className="relative">
              <button
                onClick={() => setShowDeptFilter(!showDeptFilter)}
                className={`px-5 py-3 border rounded-xl flex items-center gap-2 transition ${
                  selectedDepartment 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-gray-200 text-gray-600 hover:border-primary'
                }`}
              >
                <Building2 size={18} />
                <span>{selectedDepartment || '事業部で絞り込み'}</span>
                <span className="ml-2">▼</span>
              </button>

              {showDeptFilter && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedDepartment('')
                      setShowDeptFilter(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-600"
                  >
                    すべて表示
                  </button>
                  {Object.entries(DEPARTMENT_OPTIONS).map(([category, divisions]) => (
                    <div key={category}>
                      <div className="px-4 py-2 bg-gray-50 font-bold text-dark text-sm">
                        {category}
                      </div>
                      {Object.entries(divisions).map(([division, departments]) => (
                        <div key={division}>
                          <button
                            onClick={() => {
                              setSelectedDepartment(division)
                              setShowDeptFilter(false)
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-primary/10 ${
                              selectedDepartment === division ? 'bg-primary/10 text-primary' : ''
                            }`}
                          >
                            {division}
                          </button>
                          {departments.map((dept: string) => (
                            <button
                              key={dept}
                              onClick={() => {
                                setSelectedDepartment(dept)
                                setShowDeptFilter(false)
                              }}
                              className={`w-full px-8 py-1.5 text-left text-sm hover:bg-primary/10 ${
                                selectedDepartment === dept ? 'bg-primary/10 text-primary' : 'text-gray-600'
                              }`}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* クリアボタン */}
            {(searchText || selectedDepartment || selectedRole) && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 text-gray-500 hover:text-primary transition"
              >
                クリア
              </button>
            )}
          </div>

          {/* フィルター状態表示 */}
          {(searchText || selectedDepartment) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchText && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  検索: {searchText}
                  <button onClick={() => setSearchText('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedDepartment && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {selectedDepartment}
                  <button onClick={() => setSelectedDepartment('')} className="text-primary/60 hover:text-primary">
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 検索結果件数 */}
        <div className="mb-6">
          <p className="text-gray-600">
            検索結果: <span className="text-4xl font-bold text-primary">{filteredProfiles.length}</span> 件
          </p>
        </div>

        {/* プロフィール一覧 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-2">該当するプロフィールが見つかりません</p>
            <p className="text-gray-400">検索条件を変更してみてください</p>
            {(searchText || selectedDepartment || selectedRole) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-secondary transition"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}