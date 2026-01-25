import { describe, it, expect } from 'vitest'
import { useTypingJudge } from '../../composables/useTypingJudge'

describe('useTypingJudge', () => {
  describe('基本機能', () => {
    it('初期状態は waiting', () => {
      const typing = useTypingJudge('test')
      expect(typing.status.value).toBe('waiting')
      expect(typing.progress.value).toBe(0)
    })

    it('初回入力で状態が typing に変わる', () => {
      const typing = useTypingJudge('test')
      typing.judge('t')
      expect(typing.status.value).toBe('typing')
    })

    it('完了判定が正しく動作', () => {
      const typing = useTypingJudge('ab')
      typing.judge('a')
      typing.judge('b')
      expect(typing.status.value).toBe('completed')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.progress.value).toBe(100)
    })
  })

  describe('通常の英語入力', () => {
    it('小文字の入力', () => {
      const typing = useTypingJudge('hello')
      const result1 = typing.judge('h')
      expect(result1.isCorrect).toBe(true)
      
      const result2 = typing.judge('e')
      expect(result2.isCorrect).toBe(true)
      
      expect(typing.currentPosition.value).toBe(2)
    })

    it('大文字小文字を区別しない', () => {
      const typing = useTypingJudge('Hello')
      const result1 = typing.judge('h')
      expect(result1.isCorrect).toBe(true)
      
      const result2 = typing.judge('E')
      expect(result2.isCorrect).toBe(true)
    })

    it('誤入力でincorrectCountが増加', () => {
      const typing = useTypingJudge('abc')
      const result = typing.judge('x')
      expect(result.isCorrect).toBe(false)
      expect(typing.statistics.value.incorrectCount).toBe(1)
      expect(typing.currentPosition.value).toBe(0) // 位置は進まない
    })
  })

  describe('記号と特殊文字', () => {
    it('記号を正しく判定', () => {
      const typing = useTypingJudge('a.b,c')
      typing.judge('a')
      typing.judge('.')
      typing.judge('b')
      typing.judge(',')
      typing.judge('c')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('スペースを正しく判定', () => {
      const typing = useTypingJudge('a b')
      typing.judge('a')
      const result = typing.judge(' ')
      expect(result.isCorrect).toBe(true)
      typing.judge('b')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('改行を正しく判定', () => {
      const typing = useTypingJudge('a\nb')
      typing.judge('a')
      const result = typing.judge('\n')
      expect(result.isCorrect).toBe(true)
      typing.judge('b')
      expect(typing.isCompleted.value).toBe(true)
    })
  })

  describe('統計情報', () => {
    it('正確率の計算', () => {
      const typing = useTypingJudge('abc')
      typing.judge('a') // 正解
      typing.judge('x') // 不正解
      typing.judge('b') // 正解
      typing.judge('c') // 正解
      
      const stats = typing.statistics.value
      expect(stats.correctCount).toBe(3)
      expect(stats.incorrectCount).toBe(1)
      expect(stats.totalInputCount).toBe(4)
      expect(stats.accuracy).toBe(75) // 3/4 = 75%
    })

    it('入力履歴の記録', () => {
      const typing = useTypingJudge('ab')
      typing.judge('a')
      typing.judge('b')
      
      expect(typing.inputHistory.value).toHaveLength(2)
      expect(typing.inputHistory.value[0].inputChar).toBe('a')
      expect(typing.inputHistory.value[1].inputChar).toBe('b')
    })

    it('初期状態では100%の精度', () => {
      const typing = useTypingJudge('test')
      expect(typing.statistics.value.accuracy).toBe(100)
    })
  })

  describe('進捗率', () => {
    it('進捗率の計算', () => {
      const typing = useTypingJudge('test')
      expect(typing.progress.value).toBe(0)
      
      typing.judge('t') // 1/4
      expect(typing.progress.value).toBe(25)
      
      typing.judge('e') // 2/4
      expect(typing.progress.value).toBe(50)
      
      typing.judge('s') // 3/4
      expect(typing.progress.value).toBe(75)
      
      typing.judge('t') // 4/4
      expect(typing.progress.value).toBe(100)
    })
  })

  describe('リセット機能', () => {
    it('reset()で初期状態に戻る', () => {
      const typing = useTypingJudge('test')
      typing.judge('t')
      typing.judge('x')
      typing.judge('e')
      
      expect(typing.currentPosition.value).toBe(2)
      expect(typing.statistics.value.correctCount).toBe(2)
      
      typing.reset()
      
      expect(typing.status.value).toBe('waiting')
      expect(typing.currentPosition.value).toBe(0)
      expect(typing.statistics.value.correctCount).toBe(0)
      expect(typing.statistics.value.incorrectCount).toBe(0)
      expect(typing.inputHistory.value).toHaveLength(0)
      expect(typing.progress.value).toBe(0)
    })
  })

  describe('エッジケース', () => {
    it('完了後の入力は無視される', () => {
      const typing = useTypingJudge('a')
      typing.judge('a')
      expect(typing.isCompleted.value).toBe(true)
      
      const result = typing.judge('x')
      expect(result.isCorrect).toBe(false)
      expect(result.expectedChar).toBe('')
    })

    it('空文字列でも初期化できる', () => {
      const typing = useTypingJudge('')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.progress.value).toBe(0)
    })
  })

  describe('skipTo機能（デバッグ用）', () => {
    it('指定位置にスキップできる', () => {
      const typing = useTypingJudge('hello')
      typing.skipTo(3)
      expect(typing.currentPosition.value).toBe(3)
      expect(typing.expectedChar.value).toBe('l')
    })

    it('範囲外の位置へのスキップは無視される', () => {
      const typing = useTypingJudge('test')
      typing.skipTo(10)
      expect(typing.currentPosition.value).toBe(0) // 変更されない
    })
  })

  describe('複雑な文章', () => {
    it('英文: Hello, World!', () => {
      const typing = useTypingJudge('Hello, World!')
      'Hello, World!'.split('').forEach(char => {
        typing.judge(char)
      })
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(13)
    })

    it('プログラムコード: const x = 10;', () => {
      const typing = useTypingJudge('const x = 10;')
      'const x = 10;'.split('').forEach(char => {
        typing.judge(char)
      })
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(13)
    })
  })
})
