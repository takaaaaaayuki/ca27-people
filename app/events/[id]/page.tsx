'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/types'

type ParticipantWithProfile = {
  id: string
  event_id: string
  user_id: string
  profile: {
    name: string
    photo_url: string | null
  } | null
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    }
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')

    fetchEventAndParticipants()
  }, [params.id])

  async function fetchEventAndParticipants() {
    // イベント取得
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()

    if (eventError || !eventData) {
      console.error('Event fetch error:', eventError)
      router.push('/events')
      return
    }

    setEvent(eventData)

    // 参加者取得
    const { data: participantsData, error: participantsError } = await supabase
      .from('event_participants')
      .select('id, event_id, user_id')
      .eq('event_id', params.id)

    if (participantsError) {
      console.error('Participants fetch error:', participantsError)
    }

    if (participantsData && participantsData.length > 0) {
      // 参加者のプロフィールを別途取得
      const userIds = participantsData.map(p => p.user_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, photo_url')
        .in('user_id', userIds)

      // 参加者データとプロフィールを結合
      const participantsWithProfiles = participantsData.map(p => ({
        ...p,
        profile: profilesData?.find(prof => prof.user_id === p.user_id) || null
      }))

      setParticipants(participantsWithProfiles)

      // 自分が参加しているかチェック
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setIsParticipating(participantsData.some(p => p.user_id === user.id))
      }
    } else {
      setParticipants([])
    }

    setLoading(false)
  }

  async function handleJoin() {
    if (!userId) {
      alert('参加するにはログインしてください')
      router.push('/login')
      return
    }

    setJoining(true)

    const { error } = await supabase
      .from('event_participants')
      .insert([{ event_id: params.id, user_id: userId }])

    if (error) {
      console.error('Join error:', error)
      if (error.code === '23505') {
        alert('すでに参加登録されています')
      } else {
        alert('参加登録に失敗しました: ' + error.message)
      }
    } else {
      await fetchEventAndParticipants()
    }

    setJoining(false)
  }

  async function handleLeave() {
    if (!userId) return

    setJoining(true)

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', params.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Leave error:', error)
      alert('キャンセルに失敗しました: ' + error.message)
    } else {
      await fetchEventAndParticipants()
    }

    setJoining(false)
  }

  async function handleDelete() {
    const confirmed = window.confirm('このイベントを削除しますか？')
    if (!confirmed) return

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('削除に失敗しました')
    } else {
      router.push('/events')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${year}年${month}月${day}日(${weekday})`
  }

  const isPastEvent = event ? new Date(event.event_date) < new Date(new Date().toDateString()) : false

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!event) return null

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/events" className="text-white/80 hover:text-white mb-4 inline-block">
            ← イベント一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* イベント情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg">
              <span className="text-2xl">📅</span>
              <span className="font-bold text-dark">{formatDate(event.event_date)}</span>
              {isPastEvent && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">終了</span>
              )}
            </div>

            {event.event_time && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕐</span>
                <span className="text-dark">{event.event_time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <span className="text-dark">{event.location}</span>
              </div>
            )}

            {event.organizer && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <span className="text-dark">主催: {event.organizer}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-dark mb-2">詳細</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* 管理者のみ削除ボタン */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                このイベントを削除
              </button>
            </div>
          )}
        </div>

        {/* 参加ボタン（過去のイベントでなければ表示） */}
        {!isPastEvent && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {userId ? (
              isParticipating ? (
                <div className="text-center">
                  <p className="text-primary font-bold mb-3">✅ 参加予定です！</p>
                  <button
                    onClick={handleLeave}
                    disabled={joining}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    {joining ? '処理中...' : '参加をキャンセル'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-secondary transition text-lg disabled:opacity-50"
                  >
                    {joining ? '処理中...' : '🎉 このイベントに参加する'}
                  </button>
                </div>
              )
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-3">参加するにはログインしてください</p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-secondary transition"
                >
                  ログイン
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 参加者一覧 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            参加者 <span className="text-primary">({participants.length}人)</span>
          </h2>

          {participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">まだ参加者はいません</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-cream overflow-hidden flex-shrink-0">
                    {participant.profile?.photo_url ? (
                      <img
                        src={participant.profile.photo_url}
                        alt={participant.profile.name || '参加者'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        👤
                      </div>
                    )}
                  </div>
                  <span className="text-dark font-medium text-sm truncate">
                    {participant.profile?.name || '名前未設定'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}