'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function NewEventPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [event, setEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    organizer: '',
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setUserId(user.id)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)

    const { error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        description: event.description || null,
        event_date: event.event_date,
        event_time: event.event_time || null,
        location: event.location || null,
        organizer: event.organizer || null,
        created_by: userId,
      }])

    if (error) {
      alert('イベントの作成に失敗しました')
      console.error(error)
    } else {
      alert('イベントを作成しました！')
      router.push('/events')
    }

    setSaving(false)
  }

  if (!userId) {
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
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-2"
          >
            <ArrowLeft size={18} />
            <span>戻る</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">イベント作成</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                イベント名 *
              </label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: 第1回オンライン懇親会"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                説明
              </label>
              <textarea
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="イベントの詳細を入力..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2 flex items-center gap-1">
                <User size={16} />
                主催者名
              </label>
              <input
                type="text"
                value={event.organizer}
                onChange={(e) => setEvent({ ...event, organizer: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="名前か団体・組織・部署名"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2 flex items-center gap-1">
                  <Calendar size={16} />
                  開催日 *
                </label>
                <input
                  type="date"
                  value={event.event_date}
                  onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 flex items-center gap-1">
                  <Clock size={16} />
                  開催時間
                </label>
                <input
                  type="time"
                  value={event.event_time}
                  onChange={(e) => setEvent({ ...event, event_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2 flex items-center gap-1">
                <MapPin size={16} />
                場所
              </label>
              <input
                type="text"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: Zoom / 渋谷オフィス"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition disabled:bg-gray-400"
            >
              {saving ? '作成中...' : 'イベントを作成'}
            </button>
            <Link
              href="/events"
              className="px-8 py-4 bg-white text-dark font-medium rounded-lg hover:bg-gray-100 transition shadow-sm text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
