/**
 * 判定コンテキスト
 * 判定に必要な現在の状態を表す
 */
export interface JudgmentContext {
  /** 現在のひらがな文字 */
  hiragana: string
  /** 現在のローマ字パターン */
  romaji: string
  /** 期待される文字 */
  expected: string
  /** 入力された文字 */
  inputChar: string
  /** 現在のローマ字インデックス */
  currentRomajiIndex: number
  /** 現在のローマ字パターン内の位置 */
  currentRomajiPosition: number
  /** 全ローマ字パターン */
  romajiPatterns: string[]
}

/**
 * 判定の決定結果
 * 判定ロジックの実行結果を表す
 */
export interface JudgmentDecision {
  /** 判定が正解かどうか */
  isCorrect: boolean
  /** パターンを次に進めるべきか */
  shouldAdvancePattern: boolean
  /** パターン内の位置をインクリメントするべきか */
  shouldIncrementPosition: boolean
  /** 新しいローマ字パターン（パターン変更が必要な場合） */
  newPattern?: string
}

/**
 * 判定戦略インターフェース
 * 各判定ロジックが実装すべき契約
 */
export interface JudgmentStrategy {
  /**
   * この戦略が適用可能かどうかを判定
   */
  canHandle(context: JudgmentContext): boolean
  
  /**
   * 判定を実行し、決定を返す
   */
  judge(context: JudgmentContext): JudgmentDecision
}
