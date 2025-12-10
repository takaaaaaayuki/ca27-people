'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)

    try {
      // パスワードをハッシュ化（簡易版：本番では bcrypt 等を使用）
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // ユーザーを作成
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ email, password_hash: passwordHash }])
        .select()
        .single()

      if (userError) {
        if (userError.code === '23505') {
          setError('このメールアドレスは既に登録されています')
        } else {
          setError('登録に失敗しました')
        }
        setLoading(false)
        return
      }

      // プロフィールを作成
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: userData.id, name: 'New Member' }])

      if (profileError) {
        setError('プロフィールの作成に失敗しました')
        setLoading(false)
        return
      }

      // ローカルストレージにユーザー情報を保存（簡易認証）
      localStorage.setItem('user', JSON.stringify(userData))

      // プロフィール編集ページへ遷移
      router.push('/profile/edit')
    } catch (err) {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">新規登録</h1>

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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="6文字以上"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            パスワード（確認）
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="もう一度入力"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '登録中...' : '登録する'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は
          <Link href="/login" className="text-green-500 hover:underline ml-1">
            ログイン
          </Link>
        </p>
      </form>
    </main>
  )
}