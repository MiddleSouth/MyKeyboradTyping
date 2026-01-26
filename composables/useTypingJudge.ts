import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'
import { useBaseTypingJudge } from './useBaseTypingJudge'
import type { TypingStatus, InputResult, TypingStatistics } from '../types/typing'

const logger = createLogger('TypingJudge')

/**
 * タイピング判定を行うComposable
 */
export function useTypingJudge(targetText: string) {
  // 基底機能を利用
  const base = useBaseTypingJudge()
  
  const currentPosition = ref(0)

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
   * 入力された文字を判定
   */
  function judge(inputChar: string): InputResult {
    // 初回入力時にステータスを変更
    base.startTyping()
    if (base.status.value === 'typing' && currentPosition.value === 0) {
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
      base.incrementCorrect()
      currentPosition.value++
      logger.debug(`正解: "${inputChar}" (位置: ${currentPosition.value - 1})`)
    } else {
      base.incrementIncorrect()
      logger.debug(`不正解: 期待="${expected}" 入力="${inputChar}" (位置: ${currentPosition.value})`)
    }

    // 履歴に追加
    base.addToHistory(result)

    // 完了判定
    if (currentPosition.value >= targetText.length) {
      base.completeTyping()
      logger.debug('タイピング完了', base.statistics.value)
    }

    return result
  }

  /**
   * リセット
   */
  function reset(): void {
    currentPosition.value = 0
    base.resetBase()
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
    status: readonly(base.status),
    expectedChar,
    isCompleted,
    progress,
    statistics: base.statistics,
    inputHistory: readonly(base.inputHistory),
    judge,
    reset,
    skipTo,
  }
}
