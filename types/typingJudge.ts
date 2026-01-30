import type { Ref, ComputedRef } from 'vue'
import type { TypingStatus, InputResult, TypingStatistics } from './typing'

/**
 * 共通プロパティのベース型
 */
interface BaseTypingJudge {
  status: Readonly<Ref<TypingStatus>>
  expectedChar: ComputedRef<string | null>
  isCompleted: ComputedRef<boolean>
  progress: ComputedRef<number>
  statistics: ComputedRef<TypingStatistics>
  inputHistory: Readonly<Ref<readonly InputResult[]>>
  judge(inputChar: string): InputResult
  reset(): void
  getCurrentPosition(): number
}

/**
 * 英語タイピング判定
 */
export interface EnglishTypingJudge extends BaseTypingJudge {
  readonly kind: 'english'
  currentPosition: Readonly<Ref<number>>
  skipTo(position: number): void
}

/**
 * 日本語タイピング判定
 */
export interface JapaneseTypingJudge extends BaseTypingJudge {
  readonly kind: 'japanese'
  romajiPatterns: Readonly<Ref<readonly string[]>>
  currentRomajiIndex: Readonly<Ref<number>>
  currentRomajiPosition: Readonly<Ref<number>>
  hiraganaChars: Readonly<Ref<readonly string[]>>
  currentHiragana: ComputedRef<string | null>
  currentRomaji: ComputedRef<string | null>
}

/**
 * タイピング判定のUnion型
 */
export type TypingJudge = EnglishTypingJudge | JapaneseTypingJudge

