'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { NotificationWithUser } from '@/lib/types'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
      fetchNotifications(user.id)
    }
  }, [])

  async function fetchNotifications(uid: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      // 関連ユーザーの情報を取得
      const userIds = data.filter(n => n.related_user_id).map(n => n.related_user_id)
      let usersMap: Record<string, { name: string; photo_url: string | null }> = {}

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, photo_url')
          .in('user_id', userIds)

        profiles?.forEach(p => {
          usersMap[p.user_id] = { name: p.name, photo_url: p.photo_url }
        })
      }

      const notificationsWithUsers = data.map(n => ({
        ...n,
        related_user: n.related_user_id ? usersMap[n.related_user_id] || null : null
      }))

      setNotifications(notificationsWithUsers)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    if (!userId) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" />
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />
      case 'event_reminder': return <Calendar size={16} className="text-orange-500" />
      default: return <Bell size={16} className="text-gray-500" />
    }
  }

  if (!userId) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary transition"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* 背景クリックで閉じる */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 通知パネル */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-dark">通知</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  すべて既読にする
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  通知はありません
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || '#'}
                    onClick={() => {
                      if (!notification.is_read) markAsRead(notification.id)
                      setIsOpen(false)
                    }}
                    className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cream flex items-center justify-center overflow-hidden">
                        {notification.related_user?.photo_url ? (
                          <img 
                            src={notification.related_user.photo_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getIcon(notification.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark font-medium truncate">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}