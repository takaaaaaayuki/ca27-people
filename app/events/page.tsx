'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  max_participants: number
  created_by: string
  created_at: string
}

type Participant = {
  event_id: string
  user_id: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    }
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')

    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      setLoading(false)
      return
    }

    if (eventsData) {
      setEvents(eventsData)

      const eventIds = eventsData.map(e => e.id)
      if (eventIds.length > 0) {
        const { data: participantsData } = await supabase
          .from('event_participants')
          .select('*')
          .in('event_id', eventIds)

        if (participantsData) {
          const grouped: Record<string, Participant[]> = {}
          participantsData.forEach(p => {
            if (!grouped[p.event_id]) grouped[p.event_id] = []
            grouped[p.event_id].push(p)
          })
          setParticipants(grouped)
        }
      }
    }

    setLoading(false)
  }

  async function handleJoin(eventId: string) {
    if (!userId) return

    const { error } = await supabase
      .from('event_participants')
      .insert([{ event_id: eventId, user_id: userId }])

    if (!error) {
      setParticipants({
        ...participants,
        [eventId]: [...(participants[eventId] || []), { event_id: eventId, user_id: userId }]
      })
    }
  }

  async function handleLeave(eventId: string) {
    if (!userId) return

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (!error) {
      setParticipants({
        ...participants,
        [eventId]: (participants[eventId] || []).filter(p => p.user_id !== userId)
      })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.event_date === dateStr)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  // 今日の日付（時間なし）
  const today = new Date(new Date().toDateString())

  // 今後のイベントと過去のイベントを分ける
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= today)
  const pastEvents = events.filter(e => new Date(e.event_date) < today).sort((a, b) => 
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  )

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">イベント</h1>
          <p className="text-white/80">CA27メンバーのイベント・勉強会</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-dark">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {userId && (
            <Link
              href="/events/new"
              className="flex items-center gap-1 px-5 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
            >
              <Plus size={18} />
              <span>イベント作成</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="grid grid-cols-7">
                {weekDays.map(day => (
                  <div key={day} className="p-3 text-center font-bold text-gray-500 border-b border-gray-100">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const isToday = day && day.toDateString() === new Date().toDateString()
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${
                        !day ? 'bg-gray-50' : ''
                      } ${isToday ? 'bg-primary/5' : ''}`}
                    >
                      {day && (
                        <>
                          <span className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            {day.getDate()}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="block text-xs p-1 bg-primary/10 text-primary rounded truncate hover:bg-primary/20 transition"
                              >
                                {event.title}
                              </Link>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-xs text-gray-400">+{dayEvents.length - 2}件</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 今後のイベント */}
            <h3 className="text-xl font-bold text-dark mb-4">今後のイベント</h3>
            <div className="space-y-4 mb-12">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => {
                  const eventParticipants = participants[event.id] || []
                  const isJoined = eventParticipants.some(p => p.user_id === userId)
                  const isFull = event.max_participants > 0 && eventParticipants.length >= event.max_participants

                  return (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link href={`/events/${event.id}`} className="text-xl font-bold text-dark hover:text-primary transition">
                            {event.title}
                          </Link>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              {formatDate(event.event_date)}
                            </span>
                            {event.event_time && (
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {event.event_time}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={16} />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users size={16} />
                              {eventParticipants.length}
                              {event.max_participants > 0 && `/${event.max_participants}`}人
                            </span>
                          </div>
                        </div>

                        {userId && (
                          <div>
                            {isJoined ? (
                              <button
                                onClick={() => handleLeave(event.id)}
                                className="px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-300 transition"
                              >
                                参加取消
                              </button>
                            ) : (
                              <button
                                onClick={() => handleJoin(event.id)}
                                disabled={isFull}
                                className="px-4 py-2 bg-primary text-white font-medium rounded-full hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {isFull ? '満員' : '参加する'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">今後のイベントはありません</p>
                </div>
              )}
            </div>

            {/* 過去のイベント */}
            {pastEvents.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-dark mb-4">過去のイベント</h3>
                <div className="space-y-4">
                  {pastEvents.map(event => {
                    const eventParticipants = participants[event.id] || []

                    return (
                      <div key={event.id} className="bg-white rounded-xl shadow-sm p-6 opacity-70">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/events/${event.id}`} className="text-xl font-bold text-dark hover:text-primary transition">
                              {event.title}
                            </Link>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {formatDate(event.event_date)}
                              </span>
                              {event.event_time && (
                                <span className="flex items-center gap-1">
                                  <Clock size={16} />
                                  {event.event_time}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={16} />
                                  {event.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users size={16} />
                                {eventParticipants.length}人参加
                              </span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-500 text-sm rounded-full">
                            終了
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}