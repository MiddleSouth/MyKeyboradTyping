import { describe, it, expect, beforeEach } from 'vitest'
import { usePracticeMaterial } from '../../composables/usePracticeMaterial'

describe('usePracticeMaterial', () => {
  describe('初期状態', () => {
    it('最初の素材が選択されている', () => {
      const pm = usePracticeMaterial()
      expect(pm.currentMaterial.value).not.toBeNull()
      expect(pm.currentMaterialIndex.value).toBe(0)
    })

    it('最初の単語が選択されている', () => {
      const pm = usePracticeMaterial()
      expect(pm.currentWordIndex.value).toBe(0)
      expect(pm.currentWord.value).toBeTruthy()
    })

    it('素材リストが存在する', () => {
      const pm = usePracticeMaterial()
      expect(pm.materials.value.length).toBeGreaterThan(0)
    })

    it('日本語素材が含まれている', () => {
      const pm = usePracticeMaterial()
      const japaneseMaterial = pm.materials.value.find(m => m.isJapanese)
      expect(japaneseMaterial).toBeDefined()
    })

    it('英語素材が含まれている', () => {
      const pm = usePracticeMaterial()
      const englishMaterial = pm.materials.value.find(m => !m.isJapanese)
      expect(englishMaterial).toBeDefined()
    })
  })

  describe('単語ナビゲーション', () => {
    it('nextWord()で次の単語に進む', () => {
      const pm = usePracticeMaterial()
      const firstWord = pm.currentWord.value
      const result = pm.nextWord()
      
      expect(result).toBe(true)
      expect(pm.currentWordIndex.value).toBe(1)
      expect(pm.currentWord.value).not.toBe(firstWord)
    })

    it('最後の単語でnextWord()を呼ぶとfalseを返す', () => {
      const pm = usePracticeMaterial()
      const totalWords = pm.totalWords.value
      
      // 最後の単語まで進む
      for (let i = 0; i < totalWords - 1; i++) {
        pm.nextWord()
      }
      
      const result = pm.nextWord()
      expect(result).toBe(false)
      expect(pm.isAllWordsCompleted.value).toBe(true)
    })

    it('totalWordsが正しく計算される', () => {
      const pm = usePracticeMaterial()
      expect(pm.totalWords.value).toBe(pm.currentMaterial.value?.content.length)
    })

    it('isAllWordsCompletedが正しく動作する', () => {
      const pm = usePracticeMaterial()
      expect(pm.isAllWordsCompleted.value).toBe(false)
      
      const totalWords = pm.totalWords.value
      for (let i = 0; i < totalWords; i++) {
        pm.nextWord()
      }
      
      expect(pm.isAllWordsCompleted.value).toBe(true)
    })
  })

  describe('素材ナビゲーション', () => {
    it('nextMaterial()で次の素材に進む', () => {
      const pm = usePracticeMaterial()
      const firstMaterial = pm.currentMaterial.value
      const result = pm.nextMaterial()
      
      expect(result).toBe(true)
      expect(pm.currentMaterialIndex.value).toBe(1)
      expect(pm.currentMaterial.value).not.toBe(firstMaterial)
    })

    it('nextMaterial()で単語インデックスがリセットされる', () => {
      const pm = usePracticeMaterial()
      pm.nextWord()
      pm.nextWord()
      expect(pm.currentWordIndex.value).toBe(2)
      
      pm.nextMaterial()
      expect(pm.currentWordIndex.value).toBe(0)
    })

    it('最後の素材でnextMaterial()を呼ぶとfalseを返す', () => {
      const pm = usePracticeMaterial()
      const totalMaterials = pm.materials.value.length
      
      // 最後の素材まで進む
      for (let i = 0; i < totalMaterials - 1; i++) {
        pm.nextMaterial()
      }
      
      const result = pm.nextMaterial()
      expect(result).toBe(false)
    })

    it('previousMaterial()で前の素材に戻る', () => {
      const pm = usePracticeMaterial()
      pm.nextMaterial()
      pm.nextMaterial()
      
      const currentIndex = pm.currentMaterialIndex.value
      const result = pm.previousMaterial()
      
      expect(result).toBe(true)
      expect(pm.currentMaterialIndex.value).toBe(currentIndex - 1)
    })

    it('previousMaterial()で単語インデックスがリセットされる', () => {
      const pm = usePracticeMaterial()
      pm.nextMaterial()
      pm.nextWord()
      pm.nextWord()
      expect(pm.currentWordIndex.value).toBe(2)
      
      pm.previousMaterial()
      expect(pm.currentWordIndex.value).toBe(0)
    })

    it('最初の素材でpreviousMaterial()を呼ぶとfalseを返す', () => {
      const pm = usePracticeMaterial()
      const result = pm.previousMaterial()
      
      expect(result).toBe(false)
      expect(pm.currentMaterialIndex.value).toBe(0)
    })
  })

  describe('素材選択', () => {
    it('selectMaterial()で指定したIDの素材を選択できる', () => {
      const pm = usePracticeMaterial()
      const targetId = pm.materials.value[2]?.id
      
      if (targetId) {
        const result = pm.selectMaterial(targetId)
        expect(result).toBe(true)
        expect(pm.currentMaterial.value?.id).toBe(targetId)
      }
    })

    it('selectMaterial()で単語インデックスがリセットされる', () => {
      const pm = usePracticeMaterial()
      pm.nextWord()
      pm.nextWord()
      expect(pm.currentWordIndex.value).toBe(2)
      
      const targetId = pm.materials.value[1]?.id
      if (targetId) {
        pm.selectMaterial(targetId)
        expect(pm.currentWordIndex.value).toBe(0)
      }
    })

    it('存在しないIDを指定するとfalseを返す', () => {
      const pm = usePracticeMaterial()
      const result = pm.selectMaterial('non-existent-id')
      
      expect(result).toBe(false)
    })
  })

  describe('リセット機能', () => {
    it('reset()で最初の状態に戻る', () => {
      const pm = usePracticeMaterial()
      pm.nextMaterial()
      pm.nextWord()
      pm.nextWord()
      
      pm.reset()
      
      expect(pm.currentMaterialIndex.value).toBe(0)
      expect(pm.currentWordIndex.value).toBe(0)
    })

    it('resetWords()で単語インデックスのみリセット', () => {
      const pm = usePracticeMaterial()
      pm.nextMaterial()
      const materialIndexAfterNext = pm.currentMaterialIndex.value
      pm.nextWord()
      pm.nextWord()
      
      pm.resetWords()
      
      expect(pm.currentMaterialIndex.value).toBe(materialIndexAfterNext)
      expect(pm.currentWordIndex.value).toBe(0)
    })
  })

  describe('進捗情報', () => {
    it('overallProgressが正しく計算される', () => {
      const pm = usePracticeMaterial()
      const progress = pm.overallProgress.value
      
      expect(progress.current).toBe(0)
      expect(progress.total).toBeGreaterThan(0)
    })

    it('単語を進めるとoverallProgressが更新される', () => {
      const pm = usePracticeMaterial()
      const initialProgress = pm.overallProgress.value.current
      
      pm.nextWord()
      
      const afterProgress = pm.overallProgress.value.current
      expect(afterProgress).toBeGreaterThan(initialProgress)
    })

    it('overallProgressのtotalは素材の全文字数', () => {
      const pm = usePracticeMaterial()
      const material = pm.currentMaterial.value
      
      if (material) {
        const expectedTotal = material.content.reduce((sum, word) => sum + word.length, 0)
        expect(pm.overallProgress.value.total).toBe(expectedTotal)
      }
    })
  })

  describe('素材追加', () => {
    it('addMaterial()で新しい素材を追加できる', () => {
      const pm = usePracticeMaterial()
      const initialCount = pm.materials.value.length
      
      const newMaterial = {
        id: 'test-material',
        title: 'テスト素材',
        content: ['test1\n', 'test2\n'],
        difficulty: 'easy' as const
      }
      
      pm.addMaterial(newMaterial)
      
      expect(pm.materials.value.length).toBe(initialCount + 1)
      expect(pm.materials.value[pm.materials.value.length - 1]).toEqual(newMaterial)
    })
  })

  describe('currentTextの動作', () => {
    it('currentTextはcurrentWordと同じ値を返す', () => {
      const pm = usePracticeMaterial()
      expect(pm.currentText.value).toBe(pm.currentWord.value)
      
      pm.nextWord()
      expect(pm.currentText.value).toBe(pm.currentWord.value)
    })
  })

  describe('エッジケース', () => {
    it('素材がない場合でも動作する', () => {
      // この実装では常にBUILT_IN_MATERIALSがあるのでテスト不要かもしれないが、
      // 将来的に空の状態も想定
      const pm = usePracticeMaterial()
      expect(pm.currentMaterial.value).not.toBeNull()
    })

    it('単語がない素材を処理できる', () => {
      const pm = usePracticeMaterial()
      const emptyMaterial = {
        id: 'empty-material',
        title: '空の素材',
        content: [],
        difficulty: 'easy' as const
      }
      
      pm.addMaterial(emptyMaterial)
      pm.selectMaterial('empty-material')
      
      expect(pm.totalWords.value).toBe(0)
      expect(pm.currentWord.value).toBe('')
      expect(pm.isAllWordsCompleted.value).toBe(true)
    })
  })

  describe('素材の種類', () => {
    it('日本語素材のisJapaneseフラグが正しい', () => {
      const pm = usePracticeMaterial()
      const japaneseMaterials = pm.materials.value.filter(m => m.isJapanese)
      
      // 少なくとも1つの日本語素材がある
      expect(japaneseMaterials.length).toBeGreaterThan(0)
      
      // 日本語素材のコンテンツにひらがなが含まれている
      japaneseMaterials.forEach(material => {
        const hasHiragana = material.content.some(word => /[\u3040-\u309F]/.test(word))
        expect(hasHiragana).toBe(true)
      })
    })

    it('英語素材のisJapaneseフラグが正しい', () => {
      const pm = usePracticeMaterial()
      const englishMaterials = pm.materials.value.filter(m => !m.isJapanese)
      
      // 少なくとも1つの英語素材がある
      expect(englishMaterials.length).toBeGreaterThan(0)
    })

    it('難易度が設定されている', () => {
      const pm = usePracticeMaterial()
      
      pm.materials.value.forEach(material => {
        expect(['easy', 'normal', 'hard']).toContain(material.difficulty)
      })
    })
  })
})
