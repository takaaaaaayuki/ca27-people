export const ROLES = {
  business: {
    label: 'ビジネス',
    color: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  engineer: {
    label: 'エンジニア',
    color: 'bg-green-500',
    bgLight: 'bg-green-100',
    textColor: 'text-green-700',
  },
  designer: {
    label: 'デザイナー',
    color: 'bg-purple-500',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
} as const

export type RoleKey = keyof typeof ROLES


export const DEPARTMENT_OPTIONS: Record<string, Record<string, string[]>> = {
  "広告": {
    "インターネット広告事業本部": [
      "第一本部（石井分掌）",
      "第一本部（河合分掌）",
      "第一本部（竹内分掌）",
      "第二本部",
      "第三本部",
      "リテールメディア事業本部（本部 ×AI事業部）",
      "オンライン販促",
      "メディア本部",
      "動画本部",
      "WHAT TO SAY局（旧WW）",
      "データ本部",
      "DXコンサルティング本部",
      "エンターテインメント マーケティング Div.",
      "CR新規事業本部",
      "オペテク（本部 ×AI事業部）",
      "次世代メディア",
      "AIクリエイティブ BPO事業部",
      "株式会社CASM",
      "株式会社サイバーティカル",
    ],
    "CyberACE": [],
    "CyberZ（広告代理事業）": [],
  },
  "AI/DX": {
    "AI事業本部": [
      "アドテク",
      "小売",
      "協業DX",
      "AI Shift",
      "MG-DX",
    ],
  },
  "MIU（エンタメ＆メディア）": {
    "ABEMA": [
      "総合編成本部",
      "BD本部",
      "プラットフォーム事業本部",
      "D2C本部",
      "興行本部",
      "AJA",
    ],
    "宣伝本部": [
      "宣伝本部",
      "CA America",
    ],
    "WINTICKET": [],
    "アニメ&IP事業本部": [],
    "ライフスタイル管轄": [
      "CyberOwl",
      "AmebaLIFE事業部｜Amebaブログ",
      "AmebaLIFE事業部｜新規事業",
      "AmebaLIFE事業部｜メタバース・アバター",
    ],
    "FANTECH本部": [
      "CL事業部",
    ],
    "IU（飯塚ユニオン）": [
      "シロク",
      "CAM（新R25含む）",
      "タップル",
      "IU新規事業準備室（観光DX事業）",
    ],
  },
  "SGE（ゲーム＆エンタメ）": {
    "SGE": [
      "ゲーム事業部",
      "アプリボット（ゲーム事業）",
      "アプリボット（グローバルパートナー事業）",
      "Colorful Palette",
      "クオリアーツ",
      "グレンジ",
      "サムザップ",
      "グローバル事業部",
    ],
    "エンターテイメント事業部": [
      "IP開発本部",
      "SGEマンガ事業部",
      "アプリボット（ビジネスプロデュース事業部）",
      "アプリボット（DX事業部）",
    ],
  },
}

// フラットな選択肢リスト（検索用）
export const ALL_DEPARTMENTS: string[] = []

Object.entries(DEPARTMENT_OPTIONS).forEach(([category, divisions]) => {
  Object.entries(divisions).forEach(([division, departments]) => {
    ALL_DEPARTMENTS.push(division)
    departments.forEach((dept: string) => {
      ALL_DEPARTMENTS.push(dept)
    })
  })
})