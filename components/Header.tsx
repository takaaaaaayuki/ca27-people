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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          CA27 People
        </Link>
        <nav className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                プロフィール編集
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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