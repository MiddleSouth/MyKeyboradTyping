import { describe, it, expect } from 'vitest'
import { calculateTypingStatistics } from '../../utils/statisticsCalculator'

describe('calculateTypingStatistics', () => {
  describe('基本的な統計計算', () => {
    it('正答数と誤答数から統計を計算する', () => {
      const result = calculateTypingStatistics(8, 2)
      
      expect(result.correctCount).toBe(8)
      expect(result.incorrectCount).toBe(2)
      expect(result.totalInputCount).toBe(10)
      expect(result.accuracy).toBe(80)
    })

    it('正答数のみの場合は正確率100%', () => {
      const result = calculateTypingStatistics(10, 0)
      
      expect(result.correctCount).toBe(10)
      expect(result.incorrectCount).toBe(0)
      expect(result.totalInputCount).toBe(10)
      expect(result.accuracy).toBe(100)
    })

    it('誤答数のみの場合は正確率0%', () => {
      const result = calculateTypingStatistics(0, 10)
      
      expect(result.correctCount).toBe(0)
      expect(result.incorrectCount).toBe(10)
      expect(result.totalInputCount).toBe(10)
      expect(result.accuracy).toBe(0)
    })

    it('両方0の場合は正確率100%（初期状態）', () => {
      const result = calculateTypingStatistics(0, 0)
      
      expect(result.correctCount).toBe(0)
      expect(result.incorrectCount).toBe(0)
      expect(result.totalInputCount).toBe(0)
      expect(result.accuracy).toBe(100)
    })
  })

  describe('正確率の計算', () => {
    it('50%の場合', () => {
      const result = calculateTypingStatistics(5, 5)
      expect(result.accuracy).toBe(50)
    })

    it('75%の場合', () => {
      const result = calculateTypingStatistics(3, 1)
      expect(result.accuracy).toBe(75)
    })

    it('25%の場合', () => {
      const result = calculateTypingStatistics(1, 3)
      expect(result.accuracy).toBe(25)
    })

    it('33%の場合（小数点は四捨五入）', () => {
      const result = calculateTypingStatistics(1, 2)
      expect(result.accuracy).toBe(33)
    })

    it('67%の場合（小数点は四捨五入）', () => {
      const result = calculateTypingStatistics(2, 1)
      expect(result.accuracy).toBe(67)
    })

    it('99.5%は100%に四捨五入', () => {
      const result = calculateTypingStatistics(199, 1)
      expect(result.accuracy).toBe(100)
    })

    it('0.5%は1%に四捨五入', () => {
      const result = calculateTypingStatistics(1, 199)
      expect(result.accuracy).toBe(1)
    })
  })

  describe('大きな数値', () => {
    it('1000回の入力を処理できる', () => {
      const result = calculateTypingStatistics(900, 100)
      
      expect(result.correctCount).toBe(900)
      expect(result.incorrectCount).toBe(100)
      expect(result.totalInputCount).toBe(1000)
      expect(result.accuracy).toBe(90)
    })

    it('10000回の入力を処理できる', () => {
      const result = calculateTypingStatistics(9876, 124)
      
      expect(result.correctCount).toBe(9876)
      expect(result.incorrectCount).toBe(124)
      expect(result.totalInputCount).toBe(10000)
      expect(result.accuracy).toBe(99)
    })
  })

  describe('エッジケース', () => {
    it('正答数1、誤答数0の場合', () => {
      const result = calculateTypingStatistics(1, 0)
      
      expect(result.totalInputCount).toBe(1)
      expect(result.accuracy).toBe(100)
    })

    it('正答数0、誤答数1の場合', () => {
      const result = calculateTypingStatistics(0, 1)
      
      expect(result.totalInputCount).toBe(1)
      expect(result.accuracy).toBe(0)
    })

    it('非常に高い正確率（99.9%）', () => {
      const result = calculateTypingStatistics(999, 1)
      expect(result.accuracy).toBe(100)
    })

    it('非常に低い正確率（0.1%）', () => {
      const result = calculateTypingStatistics(1, 999)
      expect(result.accuracy).toBe(0)
    })
  })

  describe('実際のタイピングシナリオ', () => {
    it('シナリオ1: 完璧なタイピング', () => {
      // 「こんにちは」を完璧に入力 (konnitiha = 10文字)
      const result = calculateTypingStatistics(10, 0)
      
      expect(result.accuracy).toBe(100)
      expect(result.totalInputCount).toBe(10)
    })

    it('シナリオ2: 1回ミスしたタイピング', () => {
      // 「こんにちは」を1回ミスして入力 (10文字 + 1ミス)
      const result = calculateTypingStatistics(10, 1)
      
      expect(result.accuracy).toBe(91)
      expect(result.totalInputCount).toBe(11)
    })

    it('シナリオ3: 複数回ミスしたタイピング', () => {
      // 20文字入力、5回ミス
      const result = calculateTypingStatistics(20, 5)
      
      expect(result.accuracy).toBe(80)
      expect(result.totalInputCount).toBe(25)
    })

    it('シナリオ4: 累積統計（複数単語）', () => {
      // 単語1: 10文字、1ミス
      // 単語2: 15文字、2ミス
      // 単語3: 8文字、0ミス
      // 合計: 33文字、3ミス
      const result = calculateTypingStatistics(33, 3)
      
      expect(result.accuracy).toBe(92)
      expect(result.totalInputCount).toBe(36)
    })
  })

  describe('戻り値の型', () => {
    it('TypingStatistics型のオブジェクトを返す', () => {
      const result = calculateTypingStatistics(5, 2)
      
      expect(result).toHaveProperty('correctCount')
      expect(result).toHaveProperty('incorrectCount')
      expect(result).toHaveProperty('totalInputCount')
      expect(result).toHaveProperty('accuracy')
      
      expect(typeof result.correctCount).toBe('number')
      expect(typeof result.incorrectCount).toBe('number')
      expect(typeof result.totalInputCount).toBe('number')
      expect(typeof result.accuracy).toBe('number')
    })
  })
})
