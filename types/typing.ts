/**
 * タイピングの状態
 */
export type TypingStatus = 'waiting' | 'typing' | 'completed'

/**
 * 入力結果
 */
export interface InputResult {
  isCorrect: boolean
  expectedChar: string
  inputChar: string
  position: number
}

/**
 * タイピング統計
 */
export interface TypingStatistics {
  correctCount: number
  incorrectCount: number
  totalInputCount: number
  accuracy: number
}
