'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewEventPage() {
  const router = useRouter()
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
    // 管理者チェック
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      alert('管理者のみアクセスできます')
      router.push('/events')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-primary to-secondary py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">イベントを作成</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">イベント名 *</label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: オンライン座談会"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">日付 *</label>
                <input
                  type="date"
                  value={event.event_date}
                  onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">時間</label>
                <input
                  type="text"
                  value={event.event_time}
                  onChange={(e) => setEvent({ ...event, event_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: 19:00〜21:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">場所</label>
                <input
                  type="text"
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: Zoom / 渋谷オフィス"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">主催者</label>
                <input
                  type="text"
                  value={event.organizer}
                  onChange={(e) => setEvent({ ...event, organizer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: 山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">詳細・説明</label>
                <textarea
                  value={event.description}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="イベントの詳細を入力..."
                />
              </div>
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