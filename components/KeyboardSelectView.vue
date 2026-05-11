<template>
  <div class="keyboard-select-container">
    <div class="content-wrapper">
      <!-- イントロダクション -->
      <IntroductionSection 
        :is-connected="!!rawHIDData || !!selectedKeyboard" 
        :is-detecting="isDetecting"
        :is-loading="isLoading"
        :on-select-keyboard="rawHIDData || selectedKeyboard ? undefined : handleSelectAndFetch"
      />
      
      <!-- 対応キーボード一覧 -->
      <SupportedKeyboardList :is-connected="!!rawHIDData || !!selectedKeyboard" />
      
      <!-- ヘッダー -->
      <div v-if="rawHIDData || selectedKeyboard" class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">MyKeyboardTyping</h1>
        
        <!-- 右上のドロップダウン -->
        <div class="flex items-center gap-3">
          <!-- 練習素材選択 -->
          <select
            v-model="selectedMaterialId"
            @change="handleMaterialChange"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="material in materials"
              :key="material.id"
              :value="material.id"
            >
              {{ material.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p class="font-bold">エラー:</p>
        <p>{{ error }}</p>
      </div>

      <!-- タイピング練習セクション -->
      <div v-if="rawHIDData || selectedKeyboard" class="mt-6">
        <!-- 練習テキスト表示 / 完了時の結果表示 -->
        <div class="mb-4">
          <!-- 練習中：テキスト表示 -->
          <PracticeTextDisplay
            v-if="!isTypingFullyCompleted"
            :text="currentText"
            :current-position="typingPosition"
            :is-completed="typingCompleted"
            :last-input-was-correct="lastInputWasCorrect"
            :overall-current="overallProgress.current + typingPosition"
            :overall-total="overallProgress.total"
            :is-japanese="currentMaterial?.isJapanese || false"
            :romaji-patterns="romajiPatterns"
            :current-romaji-index="currentRomajiIndex"
            :current-romaji-position="currentRomajiPosition"
          />
          
          <!-- 完了時：結果表示 -->
          <CompletionPanel
            v-else
            :statistics="typingStatistics"
            :can-go-next="canGoNextMaterial"
            @retry="handleRetryTyping"
            @next="handleNextMaterial"
          />
        </div>

        <!-- キーボードレイアウト表示（キーマップがある場合のみ） -->
        <div v-if="rawHIDData" class="mb-4">
          <!-- レイヤー選択タブ -->
          <div class="mb-4">
            <LayerSelector
              v-model="selectedLayer"
              :layer-count="layerCount"
            />
          </div>

          <!-- キーボード表示 -->
          <div class="bg-white p-4 rounded-lg shadow flex justify-center">
            <KeyboardLayoutView 
              :keymapData="rawHIDData" 
              :layoutDefinition="layoutDefinition"
              :layer="selectedLayer"
              :pressedKeys="getPressedKeys(selectedLayer)"
            />
          </div>
        </div>

        <!-- 待機メッセージ（固定高さでレイアウトのずれを防ぐ） -->
        <div class="waiting-message mb-4 h-10 flex items-center justify-center">
          <div v-if="typingStatus === 'waiting'" class="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-800 text-sm">
            キーを入力して開始してください
          </div>
        </div>
      </div>

      <!-- 生データ表示 -->
      <DebugPanel :data="rawHIDData" :show-debug="false" />

      <!-- お問い合わせガイド -->
      <ContributionGuide />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import type { TypingJudge } from '../types/typingJudge'
import { createLogger } from '../composables/useLogger'
import { useKeyboardDetector } from '../composables/useKeyboardDetector'
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap'
import { useKeyboardState } from '../composables/useKeyboardState'
import { useLayerManager } from '../composables/useLayerManager'
import { useKeyHighlight } from '../composables/useKeyHighlight'
import { useKeyInput } from '../composables/useKeyInput'
import { useKeymapMatcher } from '../composables/useKeymapMatcher'
import { usePracticeMaterial } from '../composables/usePracticeMaterial'
import { useTypingJudge } from '../composables/useTypingJudge'
import { useJapaneseTypingJudge } from '../composables/useJapaneseTypingJudge'
import { useKeyboardEventHandler } from '../composables/useKeyboardEventHandler'
import { calculateTypingStatistics } from '../utils/statisticsCalculator'
import KeyboardLayoutView from './KeyboardLayoutView.vue'
import DebugPanel from './DebugPanel.vue'
import PracticeTextDisplay from './PracticeTextDisplay.vue'
import CompletionPanel from './CompletionPanel.vue'
import LayerSelector from './LayerSelector.vue'
import IntroductionSection from './IntroductionSection.vue'
import SupportedKeyboardList from './SupportedKeyboardList.vue'
import ContributionGuide from './ContributionGuide.vue'

const logger = createLogger('KeyboardSelectView')

// Composables
const { isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector()
const { isLoading, fetchKeymap, rawHIDData, layoutDefinition } = useKeyboardKeymap()
const { selectedKeyboard, error, clearError } = useKeyboardState()
const { showOnlyLayer } = useLayerManager(0)
const { pressKeys, releaseKeys, getPressedKeys } = useKeyHighlight()
const { handleKeyDown: convertKeyDown, handleKeyUp: convertKeyUp } = useKeyInput()
const { findKeysInAllLayers } = useKeymapMatcher(rawHIDData)
const { 
  currentMaterial, 
  materials,
  currentText: practiceText,
  currentWord,
  currentWordIndex,
  totalWords,
  isAllWordsCompleted,
  overallProgress,
  nextWord,
  nextMaterial, 
  selectMaterial: selectPracticeMaterial,
  resetWords
} = usePracticeMaterial()

// タイピング判定はリアクティブに再生成（日本語/英語で切り替え）
const typingJudge = computed<TypingJudge | null>(() => {
  if (!currentWord.value) return null
  if (currentMaterial.value?.isJapanese) {
    return useJapaneseTypingJudge(currentWord.value)
  }
  return useTypingJudge(currentWord.value)
})

// State
const lastInputWasCorrect = ref(true)
const selectedLayer = ref(0)
const selectedMaterialId = ref(currentMaterial.value?.id || materials.value[0]?.id || '')

// 全体の統計情報（全単語を通して累積）
const totalCorrectCount = ref(0)
const totalIncorrectCount = ref(0)

// 完了時に使用されたEnterキーのタイムスタンプ（同じイベントを無視するため）
const completionEnterTimestamp = ref<number | null>(null)

// タイピング入力ハンドラー
function handleTypingInput(inputChar: string, event?: KeyboardEvent) {
  if (typingCompleted.value || !typingJudge.value) return
  
  const result = typingJudge.value.judge(inputChar)
  lastInputWasCorrect.value = result.isCorrect
  
  // 最後の文字が完了してEnterキーだった場合、タイムスタンプを記録
  if (result.isCorrect && inputChar === '\n' && event && typingJudge.value.isCompleted.value) {
    completionEnterTimestamp.value = event.timeStamp
    logger.debug('完了時のEnterキータイムスタンプを記録', { timeStamp: event.timeStamp })
  }
}

// キーボードイベントハンドラーの設定
useKeyboardEventHandler(
  rawHIDData,
  convertKeyDown,
  convertKeyUp,
  findKeysInAllLayers,
  pressKeys,
  releaseKeys,
  handleTypingInput
)

// Computed
const layerCount = computed(() => rawHIDData.value?.layerCount ?? 0)
const currentText = computed(() => practiceText.value)
const canGoNextMaterial = computed(() => {
  const currentIndex = materials.value.findIndex((m) => m.id === currentMaterial.value?.id)
  return currentIndex < materials.value.length - 1
})
const typingStatus = computed(() => typingJudge.value?.status.value ?? 'waiting')
const typingPosition = computed(() => {
  return typingJudge.value?.getCurrentPosition() ?? 0
})
const typingCompleted = computed(() => typingJudge.value?.isCompleted.value ?? false)
const romajiPatterns = computed(() => {
  const judge = typingJudge.value
  if (!judge) return []
  if (judge.kind === 'japanese') {
    return judge.romajiPatterns.value
  }
  return []
})
const currentRomajiIndex = computed(() => {
  const judge = typingJudge.value
  if (!judge) return 0
  if (judge.kind === 'japanese') {
    return judge.currentRomajiIndex.value
  }
  return 0
})
const currentRomajiPosition = computed(() => {
  const judge = typingJudge.value
  if (!judge) return 0
  if (judge.kind === 'japanese') {
    return judge.currentRomajiPosition.value
  }
  return 0
})
const isTypingFullyCompleted = computed(() => {
  const result = isAllWordsCompleted.value
  logger.debug('isTypingFullyCompleted computed', { result, currentWordIndex: currentWordIndex.value, totalWords: totalWords.value })
  return result
})
const typingStatistics = computed(() => {
  return calculateTypingStatistics(totalCorrectCount.value, totalIncorrectCount.value)
})

// タイピング完了時に自動で次の単語に進む
watch(() => typingCompleted.value, (completed) => {
  logger.debug('typingCompleted watch', { completed, isAllWordsCompleted: isAllWordsCompleted.value })
  if (completed) {
    // 現在の単語の統計を累積
    if (typingJudge.value) {
      const stats = typingJudge.value.statistics.value
      totalCorrectCount.value += stats.correctCount
      totalIncorrectCount.value += stats.incorrectCount
      logger.debug('統計累積', {
        current: { correct: stats.correctCount, incorrect: stats.incorrectCount },
        total: { correct: totalCorrectCount.value, incorrect: totalIncorrectCount.value }
      })
    }
    
    // 次の単語に進む（タイムラグなし）
    const hasNext = nextWord()
    logger.debug('nextWord実行', { hasNext, isAllWordsCompleted: isAllWordsCompleted.value })
    if (hasNext && typingJudge.value) {
      // まだ次の単語がある場合はリセット
      typingJudge.value.reset()
      lastInputWasCorrect.value = true
    }
    // hasNextがfalseの場合は最後の単語なので、isAllWordsCompletedがtrueになり結果画面が表示される
  }
})

// 現在の素材が変更されたら、ドロップダウンの選択も同期
watch(() => currentMaterial.value?.id, (newId) => {
  if (newId && newId !== selectedMaterialId.value) {
    selectedMaterialId.value = newId
  }
})

// 完了画面でのキーボードショートカット
function handleCompletionShortcut(event: KeyboardEvent) {
  // 完了画面表示中のみ処理
  if (!isTypingFullyCompleted.value) return
  
  // 完了時に使用されたEnterキーと同じイベントを無視（タイムスタンプで判定）
  if (event.key === 'Enter' && completionEnterTimestamp.value !== null) {
    if (Math.abs(event.timeStamp - completionEnterTimestamp.value) < 50) {
      logger.debug('完了時のEnterキーと同じイベントなので無視', { timeStamp: event.timeStamp })
      completionEnterTimestamp.value = null // クリア
      return
    }
  }
  
  if (event.key === 'Backspace') {
    // BackSpace: もう一度
    event.preventDefault()
    handleRetryTyping()
  } else if (event.key === 'Enter') {
    // Enter: 次の練習へ
    event.preventDefault()
    if (canGoNextMaterial.value) {
      handleNextMaterial()
    }
  }
}

// ショートカットハンドラーを登録/解除
onMounted(() => {
  document.addEventListener('keydown', handleCompletionShortcut)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleCompletionShortcut)
})

// Methods
async function handleSelectAndFetch() {
  clearError()
  const device = await requestKeyboardSelection()
  if (device) {
    logger.debug('キーボード選択', { productName: device.productName, vendorId: device.vendorId, productId: device.productId })
    await handleContinue()
  }
}

async function handleContinue() {
  if (!selectedKeyboard.value) return
  await fetchKeymap(selectedKeyboard.value)
  // レイヤー表示を初期化（レイヤー0のみ）
  showOnlyLayer(0)
}

function handleRetryTyping() {
  resetWords()
  totalCorrectCount.value = 0
  totalIncorrectCount.value = 0
  completionEnterTimestamp.value = null
  if (typingJudge.value) {
    typingJudge.value.reset()
  }
  lastInputWasCorrect.value = true
}

function handleNextMaterial() {
  if (canGoNextMaterial.value) {
    nextMaterial()
    handleRetryTyping()
  }
}

function handleMaterialChange() {
  selectPracticeMaterial(selectedMaterialId.value)
  handleRetryTyping()
}
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  overflow-y: scroll; /* 常にスクロールバーを表示してレイアウトのずれを防ぐ */
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
</style>
