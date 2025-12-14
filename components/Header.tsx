'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NotificationBell from './NotificationBell'

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    setIsLoggedIn(!!userStr)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAdmin')
    setIsLoggedIn(false)
    router.push('/')
    window.location.reload()
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-105 transform">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <span className="text-xl font-bold text-dark tracking-tight">CA27</span>
            <span className="text-xl font-bold text-primary tracking-tight ml-1">People</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/posts"
            className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300"
          >
            ニュース
          </Link>
          <Link
            href="/events"
            className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300"
          >
            イベント
          </Link>

          {isLoggedIn ? (
            <>
              <NotificationBell />
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300"
              >
                プロフィール編集
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-cream text-dark font-medium rounded-full hover:bg-gray-200 transition-all duration-300"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}