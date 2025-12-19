import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic認証のユーザー名とパスワード
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || 'ca27'
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'people'

export function middleware(request: NextRequest) {
  // 認証が不要なパス（APIやアセット）
  const publicPaths = [
    '/api',
    '/_next',
    '/favicon.ico',
  ]
  
  const pathname = request.nextUrl.pathname
  
  // 公開パスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Basic認証チェック
  const basicAuth = request.headers.get('authorization')
  
  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')
      
      if (user === BASIC_AUTH_USER && pwd === BASIC_AUTH_PASSWORD) {
        return NextResponse.next()
      }
    } catch (e) {
      // 認証ヘッダーのパースエラー
    }
  }
  
  // 認証失敗
  return new NextResponse('CA27 People - パスワードを入力してください', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CA27 People"'
    }
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}