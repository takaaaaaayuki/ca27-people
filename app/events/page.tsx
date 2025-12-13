'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/types'

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPastEvents, setShowPastEvents] = useState(false)

  useEffect(() => {
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const today = new Date().toISOString().split('T')[0]

    // これからのイベント
    const { data: upcoming, error: upcomingError } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true })

    // 過去のイベント
    const { data: past, error: pastError } = await supabase
      .from('events')
      .select('*')
      .lt('event_date', today)
      .order('event_date', { ascending: false })

    if (upcomingError) console.error('Error fetching upcoming events:', upcomingError)
    if (pastError) console.error('Error fetching past events:', pastError)

    setUpcomingEvents(upcoming || [])
    setPastEvents(past || [])
    setLoading(false)
  }

  async function handleDelete(eventId: string, eventTitle: string) {
    const confirmed = window.confirm(`「${eventTitle}」を削除しますか？`)
    if (!confirmed) return

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      alert('削除に失敗しました')
    } else {
      setUpcomingEvents(upcomingEvents.filter(e => e.id !== eventId))
      setPastEvents(pastEvents.filter(e => e.id !== eventId))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return { month, day, weekday }
  }

  const EventCard = ({ event, isPast = false }: { event: Event; isPast?: boolean }) => {
    const { month, day, weekday } = formatDate(event.event_date)
    return (
      <div
        className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition flex ${isPast ? 'opacity-70' : ''}`}
      >
        {/* 日付 */}
        <div className={`w-24 ${isPast ? 'bg-gray-400' : 'bg-primary'} text-white flex flex-col items-center justify-center py-4`}>
          <span className="text-sm">{month}月</span>
          <span className="text-3xl font-bold">{day}</span>
          <span className="text-sm">({weekday})</span>
        </div>

        {/* 内容 */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-dark">{event.title}</h3>
              {isPast && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">終了</span>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(event.id, event.title)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                削除
              </button>
            )}
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm mb-3 mt-2 line-clamp-2">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {event.event_time && (
              <span className="flex items-center gap-1">
                🕐 {event.event_time}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                📍 {event.location}
              </span>
            )}
            {event.organizer && (
              <span className="flex items-center gap-1">
                👤 {event.organizer}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* ヒーロー */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">📅 イベントカレンダー</h1>
          <p className="text-white/90">27卒の仲間たちとの交流イベント一覧</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 管理者のみ：イベント追加ボタン */}
        {isAdmin && (
          <div className="mb-8 text-right">
            <Link
              href="/events/new"
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
            >
              ＋ イベントを追加
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <>
            {/* これからのイベント */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                <span className="text-primary"></span> これからのイベント
                <span className="text-sm font-normal text-gray-500 ml-2">({upcomingEvents.length}件)</span>
              </h2>

              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-gray-600">予定されているイベントはありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>

            {/* 過去のイベント */}
            {pastEvents.length > 0 && (
              <section>
                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className="w-full text-left text-xl font-bold text-dark mb-6 flex items-center gap-2 hover:text-primary transition"
                >
                  <span className="text-gray-400"></span> 過去のイベント
                  <span className="text-sm font-normal text-gray-500 ml-2">({pastEvents.length}件)</span>
                  <span className="ml-auto text-gray-400">{showPastEvents ? '▲' : '▼'}</span>
                </button>

                {showPastEvents && (
                  <div className="space-y-4">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id} event={event} isPast />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}