import { type Ref } from 'vue'
import { createLogger } from '../composables/useLogger'
import { selectBestPattern } from '../composables/useRomajiMapper'
import type { JudgmentContext, JudgmentDecision, JudgmentStrategy } from '../types/judgment'

const logger = createLogger('TypingJudgment')

/**
 * 特殊文字判定戦略
 * Enter、長音符、句読点、スペース、ハイフンなどを処理
 */
export class SpecialCharStrategy implements JudgmentStrategy {
  private static readonly SPECIAL_CHARS = new Set(['\n', 'ー', '-', '、', '。', ' '])

  canHandle(context: JudgmentContext): boolean {
    return SpecialCharStrategy.SPECIAL_CHARS.has(context.hiragana)
  }

  judge(context: JudgmentContext): JudgmentDecision {
    const isCorrect = context.expected === context.inputChar
    
    if (isCorrect) {
      logger.debug(`特殊文字入力検知: "${context.hiragana}" (期待: "${context.expected}", 入力: "${context.inputChar}")`)
    } else {
      logger.debug(`不正解: "${context.hiragana}"(期待: "${context.expected}")、入力: "${context.inputChar}"`)
    }

    return {
      isCorrect,
      shouldAdvancePattern: isCorrect,
      shouldIncrementPosition: false,
    }
  }
}

/**
 * 促音判定戦略
 * 「っ」の子音重ね入力を処理
 */
export class SokuonStrategy implements JudgmentStrategy {
  canHandle(context: JudgmentContext): boolean {
    return context.hiragana === 'っ' && context.currentRomajiPosition === 0
  }

  judge(context: JudgmentContext): JudgmentDecision {
    // 次のローマ字パターンの最初の文字を取得
    const nextRomajiPattern = context.currentRomajiIndex + 1 < context.romajiPatterns.length 
      ? context.romajiPatterns[context.currentRomajiIndex + 1] 
      : null
    
    // 次のパターンの最初の文字と一致すれば、促音として扱う
    const isCorrect = nextRomajiPattern !== null && nextRomajiPattern[0] === context.inputChar
    
    if (isCorrect) {
      logger.debug(`促音入力検知: 次の文字"${nextRomajiPattern}"の子音"${context.inputChar}"`)
    }

    return {
      isCorrect,
      shouldAdvancePattern: isCorrect,
      shouldIncrementPosition: false,
    }
  }
}

/**
 * 通常ひらがな判定戦略
 * 通常のひらがな入力とパターンマッチングを処理
 */
export class NormalHiraganaStrategy implements JudgmentStrategy {
  canHandle(context: JudgmentContext): boolean {
    // 特殊文字と促音以外はすべてこの戦略で処理
    return true
  }

  judge(context: JudgmentContext): JudgmentDecision {
    const partialInput = context.romaji.substring(0, context.currentRomajiPosition) + context.inputChar
    const bestPattern = selectBestPattern(context.hiragana, partialInput)
    
    logger.debug(`入力: "${context.inputChar}", 部分入力: "${partialInput}", ベストパターン: "${bestPattern}"`)
    
    const isCorrect = bestPattern !== null && bestPattern.startsWith(partialInput)
    
    if (!isCorrect) {
      logger.debug(`不正解: 期待="${context.romaji[context.currentRomajiPosition]}" 入力="${context.inputChar}"`)
      return {
        isCorrect: false,
        shouldAdvancePattern: false,
        shouldIncrementPosition: false,
      }
    }

    // パターンが変わった場合
    const shouldUpdatePattern = bestPattern !== context.romaji
    if (shouldUpdatePattern) {
      logger.debug(`ローマ字パターンを変更: "${context.romaji}" → "${bestPattern}"`)
    }

    // 現在のパターンが完了したか確認
    const currentPattern = bestPattern || context.romaji
    const newPosition = context.currentRomajiPosition + 1
    const shouldAdvancePattern = newPosition >= currentPattern.length

    if (shouldAdvancePattern) {
      logger.debug(`ローマ字パターン完了: "${currentPattern}" → "${context.hiragana}"`)
    }

    return {
      isCorrect: true,
      shouldAdvancePattern,
      shouldIncrementPosition: !shouldAdvancePattern,
      newPattern: shouldUpdatePattern ? bestPattern : undefined,
    }
  }
}

/**
 * 判定戦略のリストを作成
 */
export function createJudgmentStrategies(): JudgmentStrategy[] {
  return [
    new SpecialCharStrategy(),
    new SokuonStrategy(),
    new NormalHiraganaStrategy(), // フォールバック戦略（最後に配置）
  ]
}

// 後方互換性のため、既存の関数も残しておく
// (テストがこれらの関数を直接使用している可能性があるため)

/**
 * 特殊文字（Enter、長音符、句読点、スペース、ハイフン）の判定
 */
export function judgeSpecialChar(
  hiragana: string,
  expected: string,
  inputChar: string
): { isCorrect: boolean; shouldAdvance: boolean } {
  const isSpecialChar = hiragana === '\n' || hiragana === 'ー' || hiragana === '-' || hiragana === '、' || hiragana === '。' || hiragana === ' '
  if (!isSpecialChar) {
    return { isCorrect: false, shouldAdvance: false }
  }

  if (expected === inputChar) {
    logger.debug(`特殊文字入力検知: "${hiragana}" (期待: "${expected}", 入力: "${inputChar}")`)
    return { isCorrect: true, shouldAdvance: true }
  } else {
    logger.debug(`不正解: "${hiragana}"(期待: "${expected}")、入力: "${inputChar}"`)
    return { isCorrect: false, shouldAdvance: false }
  }
}

/**
 * 促音「っ」の判定（次の文字の子音重ね入力）
 */
export function judgeSokuon(
  hiragana: string,
  inputChar: string,
  currentRomajiIndex: number,
  currentRomajiPosition: number,
  romajiPatterns: string[]
): { isHandled: boolean; isCorrect: boolean } {
  if (hiragana !== 'っ' || currentRomajiPosition !== 0) {
    return { isHandled: false, isCorrect: false }
  }

  // 次のローマ字パターンの最初の文字を取得
  const nextRomajiPattern = currentRomajiIndex + 1 < romajiPatterns.length 
    ? romajiPatterns[currentRomajiIndex + 1] 
    : null
  
  // 次のパターンの最初の文字と一致すれば、促音として扱う
  if (nextRomajiPattern && nextRomajiPattern[0] === inputChar) {
    logger.debug(`促音入力検知: 次の文字"${nextRomajiPattern}"の子音"${inputChar}"`)
    return { isHandled: true, isCorrect: true }
  }

  return { isHandled: false, isCorrect: false }
}

/**
 * 通常のひらがなの判定（パターンマッチング）
 */
export function judgeNormalHiragana(
  hiragana: string,
  romaji: string,
  inputChar: string,
  currentRomajiPosition: number
): { isCorrect: boolean; newPattern: string | null } {
  const partialInput = romaji.substring(0, currentRomajiPosition) + inputChar
  const bestPattern = selectBestPattern(hiragana, partialInput)
  
  logger.debug(`入力: "${inputChar}", 部分入力: "${partialInput}", ベストパターン: "${bestPattern}"`)
  
  if (bestPattern && bestPattern.startsWith(partialInput)) {
    const shouldUpdatePattern = bestPattern !== romaji
    if (shouldUpdatePattern) {
      logger.debug(`ローマ字パターンを変更: "${romaji}" → "${bestPattern}"`)
    }
    return { isCorrect: true, newPattern: shouldUpdatePattern ? bestPattern : null }
  }

  logger.debug(`不正解: 期待="${romaji[currentRomajiPosition]}" 入力="${inputChar}"`)
  return { isCorrect: false, newPattern: null }
}
