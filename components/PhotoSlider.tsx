'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

type PhotoSliderProps = {
  photos: string[]
  userName: string
  size?: 'small' | 'medium' | 'large'
}

export default function PhotoSlider({ photos, userName, size = 'medium' }: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // 写真がない場合
  if (!photos || photos.length === 0) {
    const sizeClasses = {
      small: 'w-24 h-24',
      medium: 'w-40 h-40',
      large: 'w-64 h-64'
    }

    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-cream overflow-hidden shadow-md flex items-center justify-center`}>
        <User size={size === 'small' ? 40 : size === 'medium' ? 60 : 80} className="text-gray-300" />
      </div>
    )
  }

  // 写真が1枚だけの場合（スライダー不要）
  if (photos.length === 1) {
    const sizeClasses = {
      small: 'w-24 h-24',
      medium: 'w-40 h-40',
      large: 'w-64 h-64'
    }

    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-cream overflow-hidden shadow-md`}>
        <img
          src={photos[0]}
          alt={userName}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // 次へ・前へ
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64'
  }

  const buttonSize = size === 'small' ? 6 : size === 'medium' ? 8 : 10
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 22

  return (
    <div className="relative group">
      {/* メイン画像 */}
      <div className={`${sizeClasses[size]} rounded-xl bg-cream overflow-hidden shadow-md`}>
        <img
          src={photos[currentIndex]}
          alt={`${userName} - ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* 左ボタン */}
      {photos.length > 1 && (
        <button
          onClick={goToPrev}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-${buttonSize} h-${buttonSize} bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
          aria-label="前の写真"
        >
          <ChevronLeft size={iconSize} className="text-dark" />
        </button>
      )}

      {/* 右ボタン */}
      {photos.length > 1 && (
        <button
          onClick={goToNext}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-${buttonSize} h-${buttonSize} bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
          aria-label="次の写真"
        >
          <ChevronRight size={iconSize} className="text-dark" />
        </button>
      )}

      {/* インジケーター */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`写真${index + 1}へ移動`}
            />
          ))}
        </div>
      )}

      {/* 写真枚数表示 */}
      {photos.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  )
}