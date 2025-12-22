import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'

const logger = createLogger('PracticeMaterial')

/**
 * 練習素材の定義
 */
export interface PracticeMaterial {
  id: string
  title: string
  content: string
  difficulty: 'easy' | 'normal' | 'hard'
}

/**
 * ビルトイン練習素材
 */
const BUILT_IN_MATERIALS: PracticeMaterial[] = [
  {
    id: 'basic-1',
    title: '基本練習 1',
    content: 'aiueo',
    difficulty: 'easy'
  },
  {
    id: 'basic-2',
    title: '基本練習 2',
    content: 'kakikukeko',
    difficulty: 'easy'
  },
  {
    id: 'basic-3',
    title: '基本練習 3',
    content: 'hello',
    difficulty: 'easy'
  },
  {
    id: 'basic-4',
    title: '基本練習 4',
    content: 'world',
    difficulty: 'easy'
  },
  {
    id: 'sentence-1',
    title: '短文練習 1',
    content: 'the quick brown fox',
    difficulty: 'normal'
  }
]

/**
 * 練習素材を管理するComposable
 */
export function usePracticeMaterial() {
  const materials = ref<PracticeMaterial[]>(BUILT_IN_MATERIALS)
  const currentMaterialIndex = ref(0)

  /**
   * 現在の練習素材
   */
  const currentMaterial = computed(() => {
    return materials.value[currentMaterialIndex.value] || null
  })

  /**
   * 現在の練習テキスト
   */
  const currentText = computed(() => {
    return currentMaterial.value?.content || ''
  })

  /**
   * 次の素材に進む
   */
  function nextMaterial(): boolean {
    if (currentMaterialIndex.value < materials.value.length - 1) {
      currentMaterialIndex.value++
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
    logger.debug('素材をリセットしました')
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
    currentText,
    currentMaterialIndex: readonly(currentMaterialIndex),
    nextMaterial,
    previousMaterial,
    selectMaterial,
    reset,
    addMaterial,
  }
}
