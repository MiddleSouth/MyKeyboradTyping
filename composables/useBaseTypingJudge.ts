import { ref, computed } from 'vue'
import { calculateTypingStatistics } from '../utils/statisticsCalculator'
import type { TypingStatus, InputResult, TypingStatistics } from '../types/typing'

/**
 * タイピング判定の基底機能
 * 共通のステート管理と統計計算を提供
 */
export function useBaseTypingJudge() {
  // 共通ステート
  const status = ref<TypingStatus>('waiting')
  const correctCount = ref(0)
  const incorrectCount = ref(0)
  const inputHistory = ref<InputResult[]>([])

  /**
   * 統計情報
   */
  const statistics = computed<TypingStatistics>(() => {
    return calculateTypingStatistics(correctCount.value, incorrectCount.value)
  })

  /**
   * ステータスを'typing'に変更（初回入力時）
   */
  function startTyping(): void {
    if (status.value === 'waiting') {
      status.value = 'typing'
    }
  }

  /**
   * ステータスを'completed'に変更
   */
  function completeTyping(): void {
    status.value = 'completed'
  }

  /**
   * 正解カウントをインクリメント
   */
  function incrementCorrect(): void {
    correctCount.value++
  }

  /**
   * 不正解カウントをインクリメント
   */
  function incrementIncorrect(): void {
    incorrectCount.value++
  }

  /**
   * 入力履歴に追加
   */
  function addToHistory(result: InputResult): void {
    inputHistory.value.push(result)
  }

  /**
   * 全ステートをリセット
   */
  function resetBase(): void {
    status.value = 'waiting'
    correctCount.value = 0
    incorrectCount.value = 0
    inputHistory.value = []
  }

  return {
    // ステート
    status,
    correctCount,
    incorrectCount,
    inputHistory,
    
    // 計算プロパティ
    statistics,
    
    // メソッド
    startTyping,
    completeTyping,
    incrementCorrect,
    incrementIncorrect,
    addToHistory,
    resetBase,
  }
}
