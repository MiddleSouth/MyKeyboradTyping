import type { TypingStatistics } from '../types/typing'

/**
 * タイピング統計情報を計算する
 *
 * @param correctCount - 正答数
 * @param incorrectCount - 誤答数
 * @returns タイピング統計情報
 *
 * @example
 * ```typescript
 * const stats = calculateTypingStatistics(8, 2)
 * // { correctCount: 8, incorrectCount: 2, totalInputCount: 10, accuracy: 80 }
 * ```
 */
export function calculateTypingStatistics(
  correctCount: number,
  incorrectCount: number
): TypingStatistics {
  const totalInputCount = correctCount + incorrectCount
  const accuracy = totalInputCount > 0 
    ? Math.round((correctCount / totalInputCount) * 100) 
    : 100
  
  return {
    correctCount,
    incorrectCount,
    totalInputCount,
    accuracy
  }
}
