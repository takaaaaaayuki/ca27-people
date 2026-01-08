'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, UserPen, LogIn, UserPlus, Menu, X } from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // pathnameが変わるたびにログイン状態を再チェック
  useEffect(() => {
    const checkLoginStatus = () => {
      const userStr = localStorage.getItem('user')
      setIsLoggedIn(!!userStr)
    }

    checkLoginStatus()

    // storageイベントでも更新（別タブでの変更を検知）
    window.addEventListener('storage', checkLoginStatus)
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
    }
  }, [pathname])

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
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
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-105 transform">
            <span className="text-white font-bold text-lg md:text-xl">M</span>
          </div>
          <div>
            <span className="text-lg md:text-xl font-bold text-dark tracking-tight">Meet</span>
            <span className="text-lg md:text-xl font-bold text-primary tracking-tight ml-1">S</span>
          </div>
        </Link>

        {/* PC用ナビゲーション */}
        <nav className="hidden md:flex items-center gap-2">
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
                className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300 flex items-center gap-1"
              >
                <UserPen size={18} />
                <span>プロフィール編集</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-cream text-dark font-medium rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center gap-1"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors duration-300 flex items-center gap-1"
              >
                <LogIn size={18} />
                <span>ログイン</span>
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-1"
              >
                <UserPlus size={18} />
                <span>新規登録</span>
              </Link>
            </>
          )}
        </nav>

        {/* スマホ用：通知ベル＆ハンバーガーボタン */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn && <NotificationBell />}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-dark hover:text-primary transition-colors"
            aria-label="メニュー"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* スマホ用ドロワーメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col py-4">
            <Link
              href="/posts"
              className="px-6 py-3 text-dark font-medium hover:bg-cream transition-colors"
            >
              ニュース
            </Link>
            <Link
              href="/events"
              className="px-6 py-3 text-dark font-medium hover:bg-cream transition-colors"
            >
              イベント
            </Link>

            <div className="border-t border-gray-100 my-2"></div>

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile/edit"
                  className="px-6 py-3 text-dark font-medium hover:bg-cream transition-colors flex items-center gap-2"
                >
                  <UserPen size={20} />
                  <span>プロフィール編集</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 text-dark font-medium hover:bg-cream transition-colors flex items-center gap-2 text-left w-full"
                >
                  <LogOut size={20} />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-3 text-dark font-medium hover:bg-cream transition-colors flex items-center gap-2"
                >
                  <LogIn size={20} />
                  <span>ログイン</span>
                </Link>
                <Link
                  href="/register"
                  className="mx-4 my-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-full text-center"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}