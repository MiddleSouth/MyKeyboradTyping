<template>
  <div class="keyboard-select-container">
    <div class="content-wrapper">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">MyKeyboardTyping</h1>
        
        <!-- 右上のドロップダウン -->
        <div v-if="rawHIDData" class="flex items-center gap-3">
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

      <!-- メインボタン -->
      <div v-if="!rawHIDData" class="mb-6">
        <button
          @click="handleSelectAndFetch"
          :disabled="isDetecting || isLoading"
          class="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold text-lg transition shadow-lg"
        >
          {{ isDetecting || isLoading ? '処理中...' : '🎹 キーボードを選択' }}
        </button>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p class="font-bold">エラー:</p>
        <p>{{ error }}</p>
      </div>

      <!-- タイピング練習セクション -->
      <div v-if="rawHIDData" class="mt-6">
        <!-- 練習テキスト表示 / 完了時の結果表示 -->
        <div class="mb-4">
          <!-- 練習中：テキスト表示 -->
          <PracticeTextDisplay
            v-if="!typingCompleted"
            :text="currentText"
            :current-position="typingPosition"
            :is-completed="typingCompleted"
            :last-input-was-correct="lastInputWasCorrect"
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

        <!-- キーボードレイアウト表示 -->
        <div class="mb-4">
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKeyboardDetector } from '../composables/useKeyboardDetector'
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap'
import { useKeyboardState } from '../composables/useKeyboardState'
import { useLayerManager } from '../composables/useLayerManager'
import { useKeyHighlight } from '../composables/useKeyHighlight'
import { useKeyInput } from '../composables/useKeyInput'
import { useKeymapMatcher } from '../composables/useKeymapMatcher'
import { usePracticeMaterial } from '../composables/usePracticeMaterial'
import { useTypingJudge } from '../composables/useTypingJudge'
import { useKeyboardEventHandler } from '../composables/useKeyboardEventHandler'
import KeyboardLayoutView from './KeyboardLayoutView.vue'
import DebugPanel from './DebugPanel.vue'
import PracticeTextDisplay from './PracticeTextDisplay.vue'
import CompletionPanel from './CompletionPanel.vue'
import LayerSelector from './LayerSelector.vue'

// Composables
const { isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector()
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap()
const { selectedKeyboard, error, clearError } = useKeyboardState()
const { showOnlyLayer } = useLayerManager(0)
const { pressKeys, releaseKeys, getPressedKeys } = useKeyHighlight()
const { handleKeyDown: convertKeyDown, handleKeyUp: convertKeyUp } = useKeyInput()
const { findKeysInAllLayers } = useKeymapMatcher(rawHIDData)
const { 
  currentMaterial, 
  materials,
  currentText: practiceText,
  nextMaterial, 
  selectMaterial: selectPracticeMaterial 
} = usePracticeMaterial()

// タイピング判定はリアクティブに再生成
const typingJudge = computed(() => {
  if (!currentMaterial.value) return null
  return useTypingJudge(currentMaterial.value.content)
})

// State
const lastInputWasCorrect = ref(true)
const selectedLayer = ref(0)
const selectedMaterialId = ref(currentMaterial.value?.id || materials.value[0]?.id || '')

// タイピング入力ハンドラー
function handleTypingInput(inputChar: string) {
  if (typingCompleted.value || !typingJudge.value) return
  
  const result = typingJudge.value.judge(inputChar)
  lastInputWasCorrect.value = result.isCorrect
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
const typingPosition = computed(() => typingJudge.value?.currentPosition.value ?? 0)
const typingCompleted = computed(() => typingJudge.value?.isCompleted.value ?? false)
const typingStatistics = computed(() => typingJudge.value?.statistics.value ?? {
  correctCount: 0,
  incorrectCount: 0,
  totalInputCount: 0,
  accuracy: 100
})

// Methods
async function handleSelectAndFetch() {
  clearError()
  const device = await requestKeyboardSelection()
  if (device) {
    console.log('[Debug] Selected keyboard:', device)
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
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
</style>
