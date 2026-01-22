'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download } from 'lucide-react'
import QRCode from 'qrcode'

type QRCodeModalProps = {
  isOpen: boolean
  onClose: () => void
  url: string
  userName: string
}

export default function QRCodeModal({ isOpen, onClose, url, userName }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode()
    }
  }, [isOpen, url])

  const generateQRCode = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2D3748',  // QRコードの色（ダークグレー）
          light: '#FFFFFF'  // 背景色（白）
        }
      })
    } catch (error) {
      console.error('QRコード生成エラー:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    // Canvasを画像に変換してダウンロード
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${userName}_QRcode.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <X size={24} />
        </button>

        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-dark mb-2">プロフィールQRコード</h2>
          <p className="text-sm text-gray-500">{userName}さんのプロフィール</p>
        </div>

        {/* QRコード */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-100">
            {isGenerating ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>
        </div>

        {/* 説明テキスト */}
        <p className="text-center text-sm text-gray-500 mb-6">
          このQRコードをスマホで読み取ると<br />
          プロフィールページにアクセスできます
        </p>

        {/* ダウンロードボタン */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-secondary transition"
        >
          <Download size={20} />
          <span>QRコードをダウンロード</span>
        </button>
      </div>
    </div>
  )
}