import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'
import { hiraganaToRomaji, selectBestPattern, ROMAJI_TO_HIRAGANA_MAP } from './useRomajiMapper'

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
  // ひらがなテキストをローマ字パターンに変換
  const hiraganaChars = hiraganaText.split('')
  const romajiPatterns = ref<string[]>(hiraganaToRomaji(hiraganaText))
  
  logger.debug(`日本語タイピングジャッジ初期化: "${hiraganaText}"`)
  logger.debug(`ひらがな文字:`, hiraganaChars)
  logger.debug(`ローマ字パターン:`, romajiPatterns.value)
  
  const currentHiraganaIndex = ref(0)
  const currentRomajiIndex = ref(0)
  const currentRomajiPosition = ref(0) // 現在のローマ字パターン内の位置
  const status = ref<TypingStatus>('waiting')
  const correctCount = ref(0)
  const incorrectCount = ref(0)
  const inputHistory = ref<InputResult[]>([])

  /**
   * 現在のひらがな文字
   */
  const currentHiragana = computed(() => {
    if (currentHiraganaIndex.value >= hiraganaChars.length) {
      return null
    }
    return hiraganaChars[currentHiraganaIndex.value]
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
   * 入力された文字を判定
   */
  function judge(inputChar: string): InputResult {
    // 初回入力時にステータスを変更
    if (status.value === 'waiting') {
      status.value = 'typing'
      logger.debug('タイピング開始')
    }

    const expected = expectedChar.value
    const romaji = currentRomaji.value
    const hiragana = currentHiragana.value
    
    if (expected === null || !romaji || !hiragana) {
      logger.warn('すでに完了しています')
      return {
        isCorrect: false,
        expectedChar: '',
        inputChar,
        position: currentRomajiIndex.value
      }
    }

    let isCorrect = false

    // 特殊文字（1文字で完結する文字）の処理
    // Enterキー、長音符、句読点など
    const isSpecialChar = hiragana === '\n' || hiragana === 'ー' || hiragana === '、' || hiragana === '。'
    
    if (isSpecialChar) {
      // 特殊文字は期待される入力と一致するか直接チェック
      if (expected === inputChar) {
        logger.debug(`特殊文字入力検知: "${hiragana}" (期待: "${expected}", 入力: "${inputChar}")`)
        isCorrect = true
        correctCount.value++
        currentHiraganaIndex.value++
        currentRomajiIndex.value++
        currentRomajiPosition.value = 0
      } else {
        // 期待される文字と違う
        incorrectCount.value++
        logger.debug(`不正解: "${hiragana}"(期待: "${expected}")、入力: "${inputChar}"`)
      }
    } else {
      // 通常のひらがな処理
      // 現在の部分入力
      const partialInput = romaji.substring(0, currentRomajiPosition.value) + inputChar
      
      // 最適なパターンを選択（ユーザーの入力に基づく）
      const bestPattern = selectBestPattern(hiragana, partialInput)
      
      logger.debug(`入力: "${inputChar}", 期待: "${expected}", 部分入力: "${partialInput}", ベストパターン: "${bestPattern}"`)
      
      if (bestPattern && bestPattern.startsWith(partialInput)) {
        // 有効な入力
        isCorrect = true
        
        // パターンが変わった場合は更新
        if (bestPattern !== romaji) {
          logger.debug(`ローマ字パターンを変更: "${romaji}" → "${bestPattern}"`)
          romajiPatterns.value[currentRomajiIndex.value] = bestPattern
        }
        
        currentRomajiPosition.value++
        correctCount.value++
        
        // 現在のローマ字パターンが完了したか
        if (currentRomajiPosition.value >= bestPattern.length) {
          logger.debug(`ローマ字パターン完了: "${bestPattern}" → "${hiragana}"`)
          currentHiraganaIndex.value++
          currentRomajiIndex.value++
          currentRomajiPosition.value = 0
        }
      } else {
        // 無効な入力
        incorrectCount.value++
        logger.debug(`不正解: 期待="${expected}" 入力="${inputChar}"`)
      }
    }

    const result: InputResult = {
      isCorrect,
      expectedChar: expected,
      inputChar,
      position: currentRomajiIndex.value
    }

    inputHistory.value.push(result)

    // 完了判定
    if (isCompleted.value) {
      status.value = 'completed'
      logger.debug('タイピング完了', statistics.value)
    }

    return result
  }

  /**
   * リセット
   */
  function reset(): void {
    currentHiraganaIndex.value = 0
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
    currentHiraganaIndex: readonly(currentHiraganaIndex),
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
