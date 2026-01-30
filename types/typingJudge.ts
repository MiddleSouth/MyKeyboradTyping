import type { Ref, ComputedRef } from 'vue'
import type { TypingStatus, InputResult, TypingStatistics } from './typing'

/**
 * タイピング判定の共通インターフェース
 * useTypingJudgeとuseJapaneseTypingJudgeの共通API
 */
export interface ITypingJudge {
  // 共通プロパティ
  status: Readonly<Ref<TypingStatus>>
  expectedChar: ComputedRef<string | null>
  isCompleted: ComputedRef<boolean>
  progress: ComputedRef<number>
  statistics: ComputedRef<TypingStatistics>
  inputHistory: Readonly<Ref<readonly InputResult[]>>
  
  // 共通メソッド
  judge(inputChar: string): InputResult
  reset(): void
  
  // 位置情報（型によって異なるが、共通インターフェースとして提供）
  getCurrentPosition(): number
  
  // 日本語固有のプロパティ（オプショナル）
  romajiPatterns?: Readonly<Ref<string[]>>
  currentRomajiIndex?: Readonly<Ref<number>>
  currentRomajiPosition?: Readonly<Ref<number>>
  hiraganaChars?: Readonly<Ref<string[]>>
  currentHiragana?: ComputedRef<string | null>
  currentRomaji?: ComputedRef<string | null>
}
