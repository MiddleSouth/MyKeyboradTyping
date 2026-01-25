import { createLogger } from './useLogger'
import { ROMAJI_TO_HIRAGANA_MAP } from '../constants/romajiMap'
import type { RomajiPattern } from '../constants/romajiMap'

const logger = createLogger('RomajiMapper')

// 型定義を再エクスポート（後方互換性のため）
export type { RomajiPattern }
export { ROMAJI_TO_HIRAGANA_MAP }

/**
 * ひらがな文字列をローマ字パターンに変換
 * ローマ字パターンと対応するひらがな文字の配列も返す
 */
export function hiraganaToRomaji(hiragana: string): string[] {
  const result: string[] = []
  let i = 0
  
  while (i < hiragana.length) {
    let matched = false
    
    // 促音「っ」の特殊処理
    if (hiragana[i] === 'っ') {
      // 次の文字を見る
      if (i + 1 < hiragana.length) {
        const nextChar = hiragana[i + 1]
        // 次の文字のローマ字パターンを取得
        let nextRomajiPattern: string | null = null
        
        // 最長一致で次の文字のパターンを探す
        for (let len = 3; len >= 1; len--) {
          const substr = hiragana.substring(i + 1, i + 1 + len)
          const pattern = ROMAJI_TO_HIRAGANA_MAP.find(p => p.hiragana === substr)
          if (pattern) {
            nextRomajiPattern = pattern.patterns[0]
            break
          }
        }
        
        // 次の文字が子音で始まる場合、その子音を使う
        if (nextRomajiPattern && /^[bcdfghjklmnpqrstvwxyz]/.test(nextRomajiPattern)) {
          result.push(nextRomajiPattern[0])
          i++
          matched = true
        }
      }
      
      // 次の文字がない、または母音で始まる場合は「ltu」を使う
      if (!matched) {
        result.push('ltu')
        i++
        matched = true
      }
    } else {
      // 通常の文字処理
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
 * ひらがな文字列を正しい単位で分割
 * 拗音（きゃ）などは1つの単位として扱う
 */
export function splitHiragana(hiragana: string): string[] {
  const result: string[] = []
  let i = 0
  
  while (i < hiragana.length) {
    let matched = false
    
    // 最長一致を試す（3文字、2文字、1文字の順）
    for (let len = 3; len >= 1; len--) {
      const substr = hiragana.substring(i, i + len)
      const pattern = ROMAJI_TO_HIRAGANA_MAP.find(p => p.hiragana === substr)
      
      if (pattern) {
        result.push(substr) // ひらがなの文字列をそのまま追加
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
