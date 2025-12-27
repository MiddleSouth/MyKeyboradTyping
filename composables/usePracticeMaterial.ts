import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'

const logger = createLogger('PracticeMaterial')

/**
 * 練習素材の定義
 */
export interface PracticeMaterial {
  id: string
  title: string
  content: string[]  // 複数の単語をサポート
  difficulty: 'easy' | 'normal' | 'hard'
}

/**
 * ビルトイン練習素材
 */
const BUILT_IN_MATERIALS: PracticeMaterial[] = [
  {
    id: 'basic-1',
    title: '基本練習 1',
    content: ['aiueo\n', 'kakikukeko\n', 'sasisuseso\n', 'tatituteto\n', 'naninuneno\n'],
    difficulty: 'easy'
  },
  {
    id: 'basic-2',
    title: '基本練習 2',
    content: ['hamihimumeho\n', 'yamayumeyo\n', 'ramirurero\n', 'waon\n', 'nn\n'],
    difficulty: 'easy'
  },
  {
    id: 'basic-3',
    title: '英単語練習 1',
    content: ['hello\n', 'world\n', 'keyboard\n', 'typing\n', 'practice\n'],
    difficulty: 'easy'
  },
  {
    id: 'basic-4',
    title: '英単語練習 2',
    content: ['computer\n', 'mouse\n', 'display\n', 'software\n', 'hardware\n'],
    difficulty: 'easy'
  },
  {
    id: 'sentence-1',
    title: '短文練習 1',
    content: ['the quick brown fox\n', 'jumps over the lazy dog\n', 'pack my box with five dozen\n'],
    difficulty: 'normal'
  }
]

/**
 * 練習素材を管理するComposable
 */
export function usePracticeMaterial() {
  const materials = ref<PracticeMaterial[]>(BUILT_IN_MATERIALS)
  const currentMaterialIndex = ref(0)
  const currentWordIndex = ref(0)

  /**
   * 現在の練習素材
   */
  const currentMaterial = computed(() => {
    return materials.value[currentMaterialIndex.value] || null
  })

  /**
   * 現在の単語
   */
  const currentWord = computed(() => {
    if (!currentMaterial.value) return ''
    const words = currentMaterial.value.content
    if (currentWordIndex.value >= words.length) return ''
    return words[currentWordIndex.value]
  })

  /**
   * 現在の練習テキスト（後方互換性のため）
   */
  const currentText = computed(() => {
    return currentWord.value
  })

  /**
   * 総単語数
   */
  const totalWords = computed(() => {
    return currentMaterial.value?.content.length || 0
  })

  /**
   * すべての単語が完了したか
   */
  const isAllWordsCompleted = computed(() => {
    return currentWordIndex.value >= totalWords.value
  })

  /**
   * 全体の進捗情報（総文字数と現在の文字位置）
   */
  const overallProgress = computed(() => {
    if (!currentMaterial.value) {
      return { current: 0, total: 0 }
    }
    
    const words = currentMaterial.value.content
    let totalChars = 0
    let currentChars = 0
    
    // すべての単語の文字数を計算
    for (let i = 0; i < words.length; i++) {
      totalChars += words[i].length
    }
    
    // 現在までに完了した文字数を計算
    for (let i = 0; i < currentWordIndex.value; i++) {
      currentChars += words[i].length
    }
    
    return { current: currentChars, total: totalChars }
  })

  /**
   * 次の単語に進む
   */
  function nextWord(): boolean {
    console.log('[nextWord] 呼び出し - currentWordIndex:', currentWordIndex.value, 'totalWords:', totalWords.value)
    if (currentWordIndex.value < totalWords.value - 1) {
      currentWordIndex.value++
      console.log('[nextWord] 次の単語に進みました:', currentWordIndex.value, '/', totalWords.value)
      logger.debug(`次の単語に進みました: ${currentWord.value} (${currentWordIndex.value + 1}/${totalWords.value})`)
      return true
    }
    currentWordIndex.value++
    console.log('[nextWord] 最後の単語完了 - currentWordIndex:', currentWordIndex.value, 'isAllWordsCompleted:', currentWordIndex.value >= totalWords.value)
    logger.debug('これが最後の単語です')
    return false
  }

  /**
   * 次の素材に進む
   */
  function nextMaterial(): boolean {
    if (currentMaterialIndex.value < materials.value.length - 1) {
      currentMaterialIndex.value++
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`次の素材に進みました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.debug('これが最後の素材です')
    return false
  }

  /**
   * 前の素材に戻る
   */
  function previousMaterial(): boolean {
    if (currentMaterialIndex.value > 0) {
      currentMaterialIndex.value--
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`前の素材に戻りました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.debug('これが最初の素材です')
    return false
  }

  /**
   * 指定したIDの素材を選択
   */
  function selectMaterial(id: string): boolean {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      currentMaterialIndex.value = index
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`素材を選択しました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.warn(`素材が見つかりません: ${id}`)
    return false
  }

  /**
   * 素材をリセット（最初に戻す）
   */
  function reset(): void {
    currentMaterialIndex.value = 0
    currentWordIndex.value = 0
    logger.debug('素材をリセットしました')
  }

  /**
   * 現在の素材の単語インデックスだけをリセット
   */
  function resetWords(): void {
    currentWordIndex.value = 0
    logger.debug('単語インデックスをリセットしました')
  }

  /**
   * 練習素材を追加
   */
  function addMaterial(material: PracticeMaterial): void {
    materials.value.push(material)
    logger.debug(`素材を追加しました: ${material.title}`)
  }

  return {
    materials: readonly(materials),
    currentMaterial,
    currentWord,
    currentText,
    currentWordIndex: readonly(currentWordIndex),
    totalWords,
    isAllWordsCompleted,
    overallProgress,
    currentMaterialIndex: readonly(currentMaterialIndex),
    nextWord,
    nextMaterial,
    previousMaterial,
    selectMaterial,
    reset,
    resetWords,
    addMaterial,
  }
}
