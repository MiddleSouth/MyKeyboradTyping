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
    // 「次文字の子音を1文字で打つ」促音ショートカット時のみこの戦略を適用
    // 単体「っ」や母音前の「っ」は romaji が "ltu" 等になるため通常戦略に委譲する
    return context.hiragana === 'っ'
      && context.currentRomajiPosition === 0
      && context.romaji.length === 1
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
