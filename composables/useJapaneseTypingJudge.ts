import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'
import { hiraganaToRomaji, splitHiragana, ROMAJI_TO_HIRAGANA_MAP } from './useRomajiMapper'
import { createJudgmentStrategies } from '../utils/typingJudgment'
import type { JudgmentContext, JudgmentDecision } from '../types/judgment'

const logger = createLogger('JapaneseTypingJudge')

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
 * 日本語タイピング判定を行うComposable
 */
export function useJapaneseTypingJudge(hiraganaText: string) {
  // ひらがなテキストを正しい単位で分割（表示用ラベルとして使用）
  const hiraganaChars = splitHiragana(hiraganaText)
  const romajiPatterns = ref<string[]>(hiraganaToRomaji(hiraganaText))
  
  logger.debug(`日本語タイピングジャッジ初期化: "${hiraganaText}"`)
  logger.debug(`ひらがな文字:`, hiraganaChars)
  logger.debug(`ローマ字パターン:`, romajiPatterns.value)
  
  const currentRomajiIndex = ref(0)
  const currentRomajiPosition = ref(0) // 現在のローマ字パターン内の位置
  const status = ref<TypingStatus>('waiting')
  const correctCount = ref(0)
  const incorrectCount = ref(0)
  const inputHistory = ref<InputResult[]>([])
  
  // 判定戦略を初期化
  const judgmentStrategies = createJudgmentStrategies()

  /**
   * 現在のひらがな文字（表示用ラベル）
   */
  const currentHiragana = computed(() => {
    if (currentRomajiIndex.value >= hiraganaChars.length) {
      return null
    }
    return hiraganaChars[currentRomajiIndex.value]
  })

  /**
   * 現在のローマ字パターン
   */
  const currentRomaji = computed(() => {
    if (currentRomajiIndex.value >= romajiPatterns.value.length) {
      return null
    }
    return romajiPatterns.value[currentRomajiIndex.value]
  })

  /**
   * 現在期待される文字
   */
  const expectedChar = computed(() => {
    const romaji = currentRomaji.value
    if (!romaji) return null
    if (currentRomajiPosition.value >= romaji.length) return null
    return romaji[currentRomajiPosition.value]
  })

  /**
   * 完了しているか
   */
  const isCompleted = computed(() => {
    return currentRomajiIndex.value >= romajiPatterns.value.length
  })

  /**
   * 進捗率（0-100）
   */
  const progress = computed(() => {
    const totalChars = romajiPatterns.value.reduce((sum, r) => sum + r.length, 0)
    if (totalChars === 0) return 0
    
    let completedChars = 0
    for (let i = 0; i < currentRomajiIndex.value; i++) {
      completedChars += romajiPatterns.value[i].length
    }
    completedChars += currentRomajiPosition.value
    
    return Math.round((completedChars / totalChars) * 100)
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
   * 現在のパターンを完了し次に進む
   */
  function advanceToNextPattern(): void {
    currentRomajiIndex.value++
    currentRomajiPosition.value = 0
  }

  /**
   * 入力結果オブジェクトを作成
   */
  function createResult(isCorrect: boolean, expectedChar: string, inputChar: string): InputResult {
    return {
      isCorrect,
      expectedChar,
      inputChar,
      position: currentRomajiIndex.value
    }
  }

  /**
   * 判定の決定を適用し、状態を更新
   */
  function applyJudgmentDecision(decision: JudgmentDecision, expected: string, inputChar: string): InputResult {
    // 正誤カウントの更新
    if (decision.isCorrect) {
      correctCount.value++
    } else {
      incorrectCount.value++
    }

    // パターンの更新
    if (decision.newPattern) {
      romajiPatterns.value[currentRomajiIndex.value] = decision.newPattern
    }

    // 位置の更新
    if (decision.shouldAdvancePattern) {
      advanceToNextPattern()
    } else if (decision.shouldIncrementPosition) {
      currentRomajiPosition.value++
    }

    // 結果の作成と履歴への追加
    const result = createResult(decision.isCorrect, expected, inputChar)
    inputHistory.value.push(result)

    // 完了判定
    if (isCompleted.value) {
      status.value = 'completed'
      logger.debug('タイピング完了', statistics.value)
    }

    return result
  }

  /**
   * 判定コンテキストを作成
   */
  function createJudgmentContext(inputChar: string): JudgmentContext | null {
    const expected = expectedChar.value
    const romaji = currentRomaji.value
    const hiragana = currentHiragana.value

    if (expected === null || !romaji || !hiragana) {
      return null
    }

    return {
      hiragana,
      romaji,
      expected,
      inputChar,
      currentRomajiIndex: currentRomajiIndex.value,
      currentRomajiPosition: currentRomajiPosition.value,
      romajiPatterns: romajiPatterns.value,
    }
  }

  /**
   * 入力された文字を判定
   */
  function judge(inputChar: string): InputResult {
    // 初回入力時にステータスを変更
    if (status.value === 'waiting') {
      status.value = 'typing'
      logger.debug('タイピング開始')
    }

    // コンテキストの作成
    const context = createJudgmentContext(inputChar)
    
    // 完了チェック
    if (!context) {
      logger.warn('すでに完了しています')
      return createResult(false, '', inputChar)
    }

    // 適用可能な戦略を見つけて判定を実行
    const strategy = judgmentStrategies.find(s => s.canHandle(context))
    if (!strategy) {
      // フォールバック（通常は起こらないはず）
      logger.error('適用可能な判定戦略が見つかりませんでした')
      return createResult(false, context.expected, inputChar)
    }

    const decision = strategy.judge(context)
    return applyJudgmentDecision(decision, context.expected, inputChar)
  }

  /**
   * リセット
   */
  function reset(): void {
    currentRomajiIndex.value = 0
    currentRomajiPosition.value = 0
    status.value = 'waiting'
    correctCount.value = 0
    incorrectCount.value = 0
    inputHistory.value = []
    // ローマ字パターンを初期状態に戻す
    romajiPatterns.value = hiraganaToRomaji(hiraganaText)
    logger.debug('リセットしました')
  }

  return {
    hiraganaChars: readonly(ref(hiraganaChars)),
    romajiPatterns: readonly(romajiPatterns),
    currentRomajiIndex: readonly(currentRomajiIndex),
    currentRomajiPosition: readonly(currentRomajiPosition),
    currentHiragana,
    currentRomaji,
    status: readonly(status),
    expectedChar,
    isCompleted,
    progress,
    statistics,
    inputHistory: readonly(inputHistory),
    judge,
    reset,
  }
}
