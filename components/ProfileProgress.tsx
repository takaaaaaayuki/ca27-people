'use client'

import { AlertCircle } from 'lucide-react'
import { Profile } from '@/lib/types'

type ProfileProgressProps = {
  profile: Partial<Profile>
}

export default function ProfileProgress({ profile }: ProfileProgressProps) {
  // 各項目の完成状況をチェック
  const checks = {
    photo: !!profile.photo_url,
    career: !!profile.career && profile.career.trim().length > 0,
    effort: !!profile.effort && profile.effort.trim().length > 0,
    goals: !!profile.goals && profile.goals.trim().length > 0,
    departments: !!profile.interested_departments && profile.interested_departments.length > 0,
  }

  // 完成度を計算（各項目20%）
  const completedCount = Object.values(checks).filter(Boolean).length
  const totalItems = Object.keys(checks).length
  const completionRate = Math.round((completedCount / totalItems) * 100)

  // 未入力項目のリスト
  const missingItems: string[] = []
  if (!checks.photo) missingItems.push('プロフィール写真')
  if (!checks.career) missingItems.push('これまでの経歴')
  if (!checks.effort) missingItems.push('人生で頑張ったこと')
  if (!checks.goals) missingItems.push('同期でやりたいこと')
  if (!checks.departments) missingItems.push('興味のある事業部')

  // 100%完成している場合
  if (completionRate === 100) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">プロフィール完成！</h3>
            <p className="text-sm text-green-700">すべての項目が入力されています 🎉</p>
          </div>
        </div>
        <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{completionRate}%</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-900 mb-1">プロフィール完成度</h3>
          <p className="text-sm text-orange-700">
            あと{missingItems.length}項目で完成です！
          </p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-orange-200 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-orange-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* 未入力項目リスト */}
      {missingItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-orange-900">
            <AlertCircle size={16} />
            <span>未入力の項目:</span>
          </div>
          <ul className="space-y-1 ml-6">
            {missingItems.map((item) => (
              <li key={item} className="text-sm text-orange-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}