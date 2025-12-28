import { createLogger } from './useLogger'

const logger = createLogger('RomajiMapper')

/**
 * ひらがな1文字に対する複数のローマ字入力パターン
 */
export interface RomajiPattern {
  hiragana: string
  patterns: string[] // 優先順位順（最初が優先表示）
}

/**
 * ローマ字→ひらがなマッピングテーブル
 * 最長一致で判定するため、長い方から順に定義
 */
export const ROMAJI_TO_HIRAGANA_MAP: RomajiPattern[] = [
  // 小書き仮名（拗音）3文字
  { hiragana: 'きゃ', patterns: ['kya'] },
  { hiragana: 'きゅ', patterns: ['kyu'] },
  { hiragana: 'きょ', patterns: ['kyo'] },
  { hiragana: 'しゃ', patterns: ['sha', 'sya'] },
  { hiragana: 'しゅ', patterns: ['shu', 'syu'] },
  { hiragana: 'しょ', patterns: ['sho', 'syo'] },
  { hiragana: 'ちゃ', patterns: ['cha', 'tya'] },
  { hiragana: 'ちゅ', patterns: ['chu', 'tyu'] },
  { hiragana: 'ちょ', patterns: ['cho', 'tyo'] },
  { hiragana: 'にゃ', patterns: ['nya'] },
  { hiragana: 'にゅ', patterns: ['nyu'] },
  { hiragana: 'にょ', patterns: ['nyo'] },
  { hiragana: 'ひゃ', patterns: ['hya'] },
  { hiragana: 'ひゅ', patterns: ['hyu'] },
  { hiragana: 'ひょ', patterns: ['hyo'] },
  { hiragana: 'みゃ', patterns: ['mya'] },
  { hiragana: 'みゅ', patterns: ['myu'] },
  { hiragana: 'みょ', patterns: ['myo'] },
  { hiragana: 'りゃ', patterns: ['rya'] },
  { hiragana: 'りゅ', patterns: ['ryu'] },
  { hiragana: 'りょ', patterns: ['ryo'] },
  { hiragana: 'ぎゃ', patterns: ['gya'] },
  { hiragana: 'ぎゅ', patterns: ['gyu'] },
  { hiragana: 'ぎょ', patterns: ['gyo'] },
  { hiragana: 'じゃ', patterns: ['ja', 'jya', 'zya'] },
  { hiragana: 'じゅ', patterns: ['ju', 'jyu', 'zyu'] },
  { hiragana: 'じょ', patterns: ['jo', 'jyo', 'zyo'] },
  { hiragana: 'びゃ', patterns: ['bya'] },
  { hiragana: 'びゅ', patterns: ['byu'] },
  { hiragana: 'びょ', patterns: ['byo'] },
  { hiragana: 'ぴゃ', patterns: ['pya'] },
  { hiragana: 'ぴゅ', patterns: ['pyu'] },
  { hiragana: 'ぴょ', patterns: ['pyo'] },
  
  // 2文字
  { hiragana: 'あ', patterns: ['a'] },
  { hiragana: 'い', patterns: ['i'] },
  { hiragana: 'う', patterns: ['u'] },
  { hiragana: 'え', patterns: ['e'] },
  { hiragana: 'お', patterns: ['o'] },
  { hiragana: 'か', patterns: ['ka', 'ca'] },
  { hiragana: 'き', patterns: ['ki'] },
  { hiragana: 'く', patterns: ['ku', 'cu', 'qu'] },
  { hiragana: 'け', patterns: ['ke'] },
  { hiragana: 'こ', patterns: ['ko', 'co'] },
  { hiragana: 'さ', patterns: ['sa'] },
  { hiragana: 'し', patterns: ['si', 'shi', 'ci'] },
  { hiragana: 'す', patterns: ['su'] },
  { hiragana: 'せ', patterns: ['se', 'ce'] },
  { hiragana: 'そ', patterns: ['so'] },
  { hiragana: 'た', patterns: ['ta'] },
  { hiragana: 'ち', patterns: ['ti', 'chi'] },
  { hiragana: 'つ', patterns: ['tu', 'tsu'] },
  { hiragana: 'て', patterns: ['te'] },
  { hiragana: 'と', patterns: ['to'] },
  { hiragana: 'な', patterns: ['na'] },
  { hiragana: 'に', patterns: ['ni'] },
  { hiragana: 'ぬ', patterns: ['nu'] },
  { hiragana: 'ね', patterns: ['ne'] },
  { hiragana: 'の', patterns: ['no'] },
  { hiragana: 'は', patterns: ['ha'] },
  { hiragana: 'ひ', patterns: ['hi'] },
  { hiragana: 'ふ', patterns: ['hu', 'fu'] },
  { hiragana: 'へ', patterns: ['he'] },
  { hiragana: 'ほ', patterns: ['ho'] },
  { hiragana: 'ま', patterns: ['ma'] },
  { hiragana: 'み', patterns: ['mi'] },
  { hiragana: 'む', patterns: ['mu'] },
  { hiragana: 'め', patterns: ['me'] },
  { hiragana: 'も', patterns: ['mo'] },
  { hiragana: 'や', patterns: ['ya'] },
  { hiragana: 'ゆ', patterns: ['yu'] },
  { hiragana: 'よ', patterns: ['yo'] },
  { hiragana: 'ら', patterns: ['ra'] },
  { hiragana: 'り', patterns: ['ri'] },
  { hiragana: 'る', patterns: ['ru'] },
  { hiragana: 'れ', patterns: ['re'] },
  { hiragana: 'ろ', patterns: ['ro'] },
  { hiragana: 'わ', patterns: ['wa'] },
  { hiragana: 'を', patterns: ['wo'] },
  { hiragana: 'ん', patterns: ['nn', 'n'] },
  { hiragana: 'が', patterns: ['ga'] },
  { hiragana: 'ぎ', patterns: ['gi'] },
  { hiragana: 'ぐ', patterns: ['gu'] },
  { hiragana: 'げ', patterns: ['ge'] },
  { hiragana: 'ご', patterns: ['go'] },
  { hiragana: 'ざ', patterns: ['za'] },
  { hiragana: 'じ', patterns: ['zi', 'ji'] },
  { hiragana: 'ず', patterns: ['zu'] },
  { hiragana: 'ぜ', patterns: ['ze'] },
  { hiragana: 'ぞ', patterns: ['zo'] },
  { hiragana: 'だ', patterns: ['da'] },
  { hiragana: 'ぢ', patterns: ['di'] },
  { hiragana: 'づ', patterns: ['du'] },
  { hiragana: 'で', patterns: ['de'] },
  { hiragana: 'ど', patterns: ['do'] },
  { hiragana: 'ば', patterns: ['ba'] },
  { hiragana: 'び', patterns: ['bi'] },
  { hiragana: 'ぶ', patterns: ['bu'] },
  { hiragana: 'べ', patterns: ['be'] },
  { hiragana: 'ぼ', patterns: ['bo'] },
  { hiragana: 'ぱ', patterns: ['pa'] },
  { hiragana: 'ぴ', patterns: ['pi'] },
  { hiragana: 'ぷ', patterns: ['pu'] },
  { hiragana: 'ぺ', patterns: ['pe'] },
  { hiragana: 'ぽ', patterns: ['po'] },
  
  // 特殊
  { hiragana: 'ー', patterns: ['-'] },
  { hiragana: '、', patterns: [','] },
  { hiragana: '。', patterns: ['.'] },
]

/**
 * ひらがな文字列をローマ字パターンに変換
 */
export function hiraganaToRomaji(hiragana: string): string[] {
  const result: string[] = []
  let i = 0
  
  while (i < hiragana.length) {
    let matched = false
    
    // 最長一致を試す（3文字、2文字、1文字の順）
    for (let len = 3; len >= 1; len--) {
      const substr = hiragana.substring(i, i + len)
      const pattern = ROMAJI_TO_HIRAGANA_MAP.find(p => p.hiragana === substr)
      
      if (pattern) {
        result.push(pattern.patterns[0]) // デフォルトは最初のパターン
        i += len
        matched = true
        break
      }
    }
    
    if (!matched) {
      // マッチしない文字はそのまま追加
      result.push(hiragana[i])
      i++
    }
  }
  
  return result
}

/**
 * 部分的なローマ字入力から、可能性のあるパターンを検索
 */
export function findMatchingPatterns(partialInput: string): RomajiPattern[] {
  return ROMAJI_TO_HIRAGANA_MAP.filter(pattern => 
    pattern.patterns.some(p => p.startsWith(partialInput))
  )
}

/**
 * 入力された文字が、指定されたひらがなの候補として有効かチェック
 */
export function isValidInput(hiragana: string, partialInput: string): boolean {
  const pattern = ROMAJI_TO_HIRAGANA_MAP.find(p => p.hiragana === hiragana)
  if (!pattern) return false
  
  return pattern.patterns.some(p => p.startsWith(partialInput))
}

/**
 * 現在の入力に基づいて、最適なローマ字パターンを選択
 */
export function selectBestPattern(hiragana: string, partialInput: string): string | null {
  const pattern = ROMAJI_TO_HIRAGANA_MAP.find(p => p.hiragana === hiragana)
  if (!pattern) return null
  
  // 入力に一致する候補を探す
  const matching = pattern.patterns.find(p => p.startsWith(partialInput))
  return matching || pattern.patterns[0]
}
