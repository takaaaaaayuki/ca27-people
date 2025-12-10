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
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

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

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: userData.id, name: 'New Member' }])

      if (profileError) {
        setError('プロフィールの作成に失敗しました')
        setLoading(false)
        return
      }

      localStorage.setItem('user', JSON.stringify(userData))
      router.push('/profile/edit')
    } catch (err) {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white font-display text-3xl">C</span>
          </div>
          <h1 className="text-3xl font-display text-dark">新規登録</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-body">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-display text-dark mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body transition-all duration-300"
              placeholder="example@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-display text-dark mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body transition-all duration-300"
              placeholder="6文字以上"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-display text-dark mb-2">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body transition-all duration-300"
              placeholder="もう一度入力"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-display text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '登録中...' : '登録する'}
          </button>

          <p className="mt-8 text-center text-sm text-gray-500 font-body">
            すでにアカウントをお持ちの方は
            <Link href="/login" className="text-primary font-medium hover:underline ml-1">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}