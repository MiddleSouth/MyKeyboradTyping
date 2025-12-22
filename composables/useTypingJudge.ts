import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'

const logger = createLogger('TypingJudge')

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

/**
 * タイピング判定を行うComposable
 */
export function useTypingJudge(targetText: string) {
  const currentPosition = ref(0)
  const status = ref<TypingStatus>('waiting')
  const correctCount = ref(0)
  const incorrectCount = ref(0)
  const inputHistory = ref<InputResult[]>([])

  /**
   * 現在期待される文字
   */
  const expectedChar = computed(() => {
    if (currentPosition.value >= targetText.length) {
      return null
    }
    return targetText[currentPosition.value]
  })

  /**
   * 完了しているか
   */
  const isCompleted = computed(() => {
    return currentPosition.value >= targetText.length
  })

  /**
   * 進捗率（0-100）
   */
  const progress = computed(() => {
    if (targetText.length === 0) return 0
    return Math.round((currentPosition.value / targetText.length) * 100)
  })

  /**
   * 統計情報
   */
  const statistics = computed<TypingStatistics>(() => {
    const totalInputCount = correctCount.value + incorrectCount.value
    const accuracy = totalInputCount > 0 
      ? Math.round((correctCount.value / totalInputCount) * 100) 
      : 100
    
    return {
      correctCount: correctCount.value,
      incorrectCount: incorrectCount.value,
      totalInputCount,
      accuracy
    }
  })

  /**
   * 入力された文字を判定
   */
  function judge(inputChar: string): InputResult {
    // 初回入力時にステータスを変更
    if (status.value === 'waiting') {
      status.value = 'typing'
      logger.debug('タイピング開始')
    }

    const expected = expectedChar.value
    
    if (expected === null) {
      logger.warn('すでに完了しています')
      return {
        isCorrect: false,
        expectedChar: '',
        inputChar,
        position: currentPosition.value
      }
    }

    // 大文字小文字を区別せずに判定（フェーズ1では簡単に）
    const isCorrect = inputChar.toLowerCase() === expected.toLowerCase()
    
    const result: InputResult = {
      isCorrect,
      expectedChar: expected,
      inputChar,
      position: currentPosition.value
    }

    // 統計を更新
    if (isCorrect) {
      correctCount.value++
      currentPosition.value++
      logger.debug(`正解: "${inputChar}" (位置: ${currentPosition.value - 1})`)
    } else {
      incorrectCount.value++
      logger.debug(`不正解: 期待="${expected}" 入力="${inputChar}" (位置: ${currentPosition.value})`)
    }

    // 履歴に追加
    inputHistory.value.push(result)

    // 完了判定
    if (currentPosition.value >= targetText.length) {
      status.value = 'completed'
      logger.debug('タイピング完了', statistics.value)
    }

    return result
  }

  /**
   * リセット
   */
  function reset(): void {
    currentPosition.value = 0
    status.value = 'waiting'
    correctCount.value = 0
    incorrectCount.value = 0
    inputHistory.value = []
    logger.debug('リセットしました')
  }

  /**
   * 指定位置までスキップ（デバッグ用）
   */
  function skipTo(position: number): void {
    if (position >= 0 && position <= targetText.length) {
      currentPosition.value = position
      logger.debug(`位置 ${position} にスキップしました`)
    }
  }

  return {
    currentPosition: readonly(currentPosition),
    status: readonly(status),
    expectedChar,
    isCompleted,
    progress,
    statistics,
    inputHistory: readonly(inputHistory),
    judge,
    reset,
    skipTo,
  }
}
