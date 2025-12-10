'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    setIsLoggedIn(!!userStr)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/')
    window.location.reload()
  }

  return (
    <header className="bg-white border-b-4 border-secondary">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-2xl font-bold text-primary">CA27 People</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile/edit"
                className="px-5 py-2 text-primary font-medium hover:bg-cream rounded-full transition"
              >
                プロフィール編集
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-cream text-primary font-medium rounded-full hover:bg-gray-100 transition"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-primary font-medium hover:bg-cream rounded-full transition"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
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