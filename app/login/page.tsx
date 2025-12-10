'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // パスワードをハッシュ化
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // ユーザーを検索
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single()

      if (userError || !userData) {
        setError('メールアドレスまたはパスワードが正しくありません')
        setLoading(false)
        return
      }

      // ローカルストレージにユーザー情報を保存
      localStorage.setItem('user', JSON.stringify(userData))

      // トップページへ遷移
      router.push('/')
    } catch (err) {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">ログイン</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="example@email.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="パスワード"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          アカウントをお持ちでない方は
          <Link href="/register" className="text-green-500 hover:underline ml-1">
            新規登録
          </Link>
        </p>
      </form>
    </main>
  )
}