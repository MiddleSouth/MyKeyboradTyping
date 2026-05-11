import { describe, it, expect, beforeEach } from 'vitest'
import { useJapaneseTypingJudge } from '../../composables/useJapaneseTypingJudge'

describe('useJapaneseTypingJudge', () => {
  describe('基本機能', () => {
    it('初期状態は waiting', () => {
      const typing = useJapaneseTypingJudge('あ')
      expect(typing.status.value).toBe('waiting')
      expect(typing.progress.value).toBe(0)
    })

    it('初回入力で状態が typing に変わる', () => {
      const typing = useJapaneseTypingJudge('あい')
      typing.judge('a')
      expect(typing.status.value).toBe('typing')
      expect(typing.isCompleted.value).toBe(false)
    })

    it('完了判定が正しく動作', () => {
      const typing = useJapaneseTypingJudge('あ')
      const result = typing.judge('a')
      expect(result.isCorrect).toBe(true)
      expect(typing.status.value).toBe('completed')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.progress.value).toBe(100)
    })
  })

  describe('通常のひらがな入力', () => {
    it('あ → a で正解', () => {
      const typing = useJapaneseTypingJudge('あ')
      const result = typing.judge('a')
      expect(result.isCorrect).toBe(true)
      expect(result.inputChar).toBe('a')
      expect(result.expectedChar).toBe('a')
      expect(typing.statistics.value.correctCount).toBe(1)
    })

    it('か → ka で正解', () => {
      const typing = useJapaneseTypingJudge('か')
      const result1 = typing.judge('k')
      expect(result1.isCorrect).toBe(true)
      const result2 = typing.judge('a')
      expect(result2.isCorrect).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(2)
    })

    it('複数文字: あいう → aiu', () => {
      const typing = useJapaneseTypingJudge('あいう')
      typing.judge('a')
      typing.judge('i')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(3)
    })

    it('誤入力でincorrectCountが増加', () => {
      const typing = useJapaneseTypingJudge('あ')
      const result = typing.judge('x')
      expect(result.isCorrect).toBe(false)
      expect(typing.statistics.value.incorrectCount).toBe(1)
      expect(typing.currentRomajiIndex.value).toBe(0)
    })

    it('大文字英字入力でも正解判定される', () => {
      const typing = useJapaneseTypingJudge('あ')
      const result = typing.judge('A')
      expect(result.isCorrect).toBe(true)
      expect(result.inputChar).toBe('a')
      expect(typing.isCompleted.value).toBe(true)
    })
  })

  describe('パターン切り替え', () => {
    it('し → si で正解', () => {
      const typing = useJapaneseTypingJudge('し')
      const result1 = typing.judge('s')
      expect(result1.isCorrect).toBe(true)
      const result2 = typing.judge('i')
      expect(result2.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('し → shi で正解', () => {
      const typing = useJapaneseTypingJudge('し')
      const result1 = typing.judge('s')
      expect(result1.isCorrect).toBe(true)
      const result2 = typing.judge('h')
      expect(result2.isCorrect).toBe(true)
      const result3 = typing.judge('i')
      expect(result3.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('ち → ti で正解', () => {
      const typing = useJapaneseTypingJudge('ち')
      typing.judge('t')
      typing.judge('i')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('ち → chi で正解', () => {
      const typing = useJapaneseTypingJudge('ち')
      typing.judge('c')
      typing.judge('h')
      typing.judge('i')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('ふ → hu で正解', () => {
      const typing = useJapaneseTypingJudge('ふ')
      typing.judge('h')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('ふ → fu で正解', () => {
      const typing = useJapaneseTypingJudge('ふ')
      typing.judge('f')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
    })
  })

  describe('拗音（きゃ、しゃ等）', () => {
    it('きゃ → kya', () => {
      const typing = useJapaneseTypingJudge('きゃ')
      typing.judge('k')
      typing.judge('y')
      typing.judge('a')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('しゃ → sha', () => {
      const typing = useJapaneseTypingJudge('しゃ')
      typing.judge('s')
      typing.judge('h')
      typing.judge('a')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('しゃ → sya でも正解', () => {
      const typing = useJapaneseTypingJudge('しゃ')
      typing.judge('s')
      typing.judge('y')
      typing.judge('a')
      expect(typing.isCompleted.value).toBe(true)
    })
  })

  describe('促音（っ）の処理', () => {
    it('っ 単体は ltu で正解', () => {
      const typing = useJapaneseTypingJudge('っ')
      typing.judge('l')
      typing.judge('t')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('っ 単体は xtu でも正解', () => {
      const typing = useJapaneseTypingJudge('っ')
      typing.judge('x')
      typing.judge('t')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('きって → kitte（子音重ね）', () => {
      const typing = useJapaneseTypingJudge('きって')
      typing.judge('k')
      typing.judge('i')
      typing.judge('t') // っ
      typing.judge('t')
      typing.judge('e')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(5)
    })

    it('がっこう → gakkou', () => {
      const typing = useJapaneseTypingJudge('がっこう')
      typing.judge('g')
      typing.judge('a')
      typing.judge('k') // っ
      typing.judge('k')
      typing.judge('o')
      typing.judge('u')
      expect(typing.isCompleted.value).toBe(true)
    })

    it('さっぽろ → sapporo', () => {
      const typing = useJapaneseTypingJudge('さっぽろ')
      typing.judge('s')
      typing.judge('a')
      typing.judge('p') // っ
      typing.judge('p')
      typing.judge('o')
      typing.judge('r')
      typing.judge('o')
      expect(typing.isCompleted.value).toBe(true)
    })
  })

  describe('特殊文字の処理', () => {
    it('句点（。）→ . で正解', () => {
      const typing = useJapaneseTypingJudge('。')
      const result = typing.judge('.')
      expect(result.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('読点（、）→ , で正解', () => {
      const typing = useJapaneseTypingJudge('、')
      const result = typing.judge(',')
      expect(result.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('長音符（ー）→ - で正解', () => {
      const typing = useJapaneseTypingJudge('ー')
      const result = typing.judge('-')
      expect(result.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('スペース → スペースで正解', () => {
      const typing = useJapaneseTypingJudge(' ')
      const result = typing.judge(' ')
      expect(result.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('改行（\\n）→ \\n で正解', () => {
      const typing = useJapaneseTypingJudge('\n')
      const result = typing.judge('\n')
      expect(result.isCorrect).toBe(true)
      expect(typing.isCompleted.value).toBe(true)
    })

    it('特殊文字への誤入力', () => {
      const typing = useJapaneseTypingJudge('。')
      const result = typing.judge('x')
      expect(result.isCorrect).toBe(false)
      expect(typing.statistics.value.incorrectCount).toBe(1)
    })
  })

  describe('統計情報', () => {
    it('正確率の計算', () => {
      const typing = useJapaneseTypingJudge('あい')
      typing.judge('a') // 正解
      typing.judge('x') // 不正解
      typing.judge('i') // 正解
      
      const stats = typing.statistics.value
      expect(stats.correctCount).toBe(2)
      expect(stats.incorrectCount).toBe(1)
      expect(stats.totalInputCount).toBe(3)
      expect(stats.accuracy).toBe(67) // 2/3 = 66.666... → 67%
    })

    it('入力履歴の記録', () => {
      const typing = useJapaneseTypingJudge('か')
      typing.judge('k')
      typing.judge('a')
      
      expect(typing.inputHistory.value).toHaveLength(2)
      expect(typing.inputHistory.value[0].inputChar).toBe('k')
      expect(typing.inputHistory.value[1].inputChar).toBe('a')
    })
  })

  describe('進捗率', () => {
    it('進捗率の計算: あいう', () => {
      const typing = useJapaneseTypingJudge('あいう')
      expect(typing.progress.value).toBe(0)
      
      typing.judge('a') // 1/3
      expect(typing.progress.value).toBe(33)
      
      typing.judge('i') // 2/3
      expect(typing.progress.value).toBe(67)
      
      typing.judge('u') // 3/3
      expect(typing.progress.value).toBe(100)
    })

    it('進捗率の計算: か（2文字）', () => {
      const typing = useJapaneseTypingJudge('か')
      expect(typing.progress.value).toBe(0)
      
      typing.judge('k') // 1/2
      expect(typing.progress.value).toBe(50)
      
      typing.judge('a') // 2/2
      expect(typing.progress.value).toBe(100)
    })
  })

  describe('リセット機能', () => {
    it('reset()で初期状態に戻る', () => {
      const typing = useJapaneseTypingJudge('あい')
      typing.judge('a')
      typing.judge('x')
      typing.judge('i')
      
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(2)
      
      typing.reset()
      
      expect(typing.status.value).toBe('waiting')
      expect(typing.currentRomajiIndex.value).toBe(0)
      expect(typing.currentRomajiPosition.value).toBe(0)
      expect(typing.statistics.value.correctCount).toBe(0)
      expect(typing.statistics.value.incorrectCount).toBe(0)
      expect(typing.inputHistory.value).toHaveLength(0)
      expect(typing.progress.value).toBe(0)
    })
  })

  describe('エッジケース', () => {
    it('完了後の入力は無視される', () => {
      const typing = useJapaneseTypingJudge('あ')
      typing.judge('a')
      expect(typing.isCompleted.value).toBe(true)
      
      const result = typing.judge('x')
      expect(result.isCorrect).toBe(false)
      expect(result.expectedChar).toBe('')
    })

    it('空文字列でも初期化できる', () => {
      const typing = useJapaneseTypingJudge('')
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.progress.value).toBe(0)
    })
  })

  describe('複合パターン', () => {
    it('複雑な文章: こんにちは → konnitiha', () => {
      const typing = useJapaneseTypingJudge('こんにちは')
      // 'ん'は'nn'なので正しくは 'konnnitiha'
      'konnnitiha'.split('').forEach(char => {
        typing.judge(char)
      })
      expect(typing.isCompleted.value).toBe(true)
    })

    it('促音と拗音の組み合わせ: きゃっと → kyatto', () => {
      const typing = useJapaneseTypingJudge('きゃっと')
      'kyatto'.split('').forEach(char => {
        typing.judge(char)
      })
      expect(typing.isCompleted.value).toBe(true)
      expect(typing.statistics.value.correctCount).toBe(6)
    })
  })
})
