<template>
  <div class="keyboard-select-container">
    <div class="container mx-auto p-6 max-w-4xl">
      <h1 class="text-3xl font-bold mb-8">MyKeyboardTyping</h1>

      <!-- 説明文 -->
      <InstructionBanner />

      <!-- メインボタン -->
      <div class="mb-6">
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

      <!-- 選択されたキーボード情報 -->
      <KeyboardInfo :keyboard="selectedKeyboard">
        <template #actions>
          <button
            @click="handleContinue"
            :disabled="isLoading"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium transition"
          >
            {{ isLoading ? 'キーマップ取得中...' : '🔄 キーマップを再取得（デバッグ用）' }}
          </button>
        </template>
      </KeyboardInfo>

      <!-- タイピング練習セクション -->
      <div v-if="rawHIDData && showTypingPractice" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">タイピング練習</h2>
          <button
            @click="showTypingPractice = false"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            × 閉じる
          </button>
        </div>

        <!-- ステータス表示 -->
        <div v-if="typingStatus !== 'waiting'" class="status-panel mb-6 p-4 bg-white rounded-lg shadow">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-600">{{ typingStatistics.correctCount }}</div>
              <div class="text-sm text-gray-600">正解</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">{{ typingStatistics.incorrectCount }}</div>
              <div class="text-sm text-gray-600">ミス</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ typingStatistics.accuracy }}%</div>
              <div class="text-sm text-gray-600">正確率</div>
            </div>
          </div>
        </div>

        <!-- 練習テキスト表示 -->
        <PracticeTextDisplay
          :text="currentText"
          :current-position="typingPosition"
          :is-completed="typingCompleted"
          :last-input-was-correct="lastInputWasCorrect"
        />

        <!-- 完了メッセージ -->
        <div v-if="typingCompleted" class="completion-message mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
          <div class="text-3xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-green-800 mb-2">完了！</h2>
          <p class="text-green-700 mb-4">
            正確率: {{ typingStatistics.accuracy }}% ({{ typingStatistics.correctCount }}正解 / {{ typingStatistics.incorrectCount }}ミス)
          </p>
          <div class="flex gap-4 justify-center">
            <button
              @click="handleRetryTyping"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              もう一度
            </button>
            <button
              @click="handleNextMaterial"
              :disabled="!canGoNextMaterial"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              次の練習へ
            </button>
          </div>
        </div>

        <!-- 待機メッセージ -->
        <div v-if="typingStatus === 'waiting'" class="waiting-message mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-800">
          キーを入力して開始してください
        </div>

        <!-- 素材選択 -->
        <div class="material-selector mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-bold mb-3">練習素材を選択</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <button
              v-for="material in materials"
              :key="material.id"
              @click="selectPracticeMaterial(material.id)"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition text-sm',
                material.id === currentMaterial?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              ]"
            >
              {{ material.title }}
            </button>
          </div>
        </div>
      </div>

      <!-- タイピング練習開始ボタン -->
      <div v-if="rawHIDData && !showTypingPractice" class="mt-6">
        <button
          @click="showTypingPractice = true"
          class="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition shadow-lg"
        >
          ✍️ タイピング練習を開始
        </button>
      </div>

      <!-- キーボードレイアウト表示（全レイヤー） -->
      <div v-if="rawHIDData" class="mt-6">
        <h2 class="text-2xl font-bold mb-4">キーマップ - 全レイヤー</h2>
        
        <LayerPanel
          v-for="layerNum in layerCount"
          :key="layerNum - 1"
          :layer-number="layerNum - 1"
          :is-visible="isLayerVisible(layerNum - 1)"
          @toggle="toggleLayer(layerNum - 1)"
        >
          <KeyboardLayoutView 
            :keymapData="rawHIDData" 
            :layer="layerNum - 1"
            :pressedKeys="getPressedKeys(layerNum - 1)"
          />
        </LayerPanel>
      </div>

      <!-- 生データ表示 -->
      <DebugPanel :data="rawHIDData" :show-debug="false" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useKeyboardDetector } from '../composables/useKeyboardDetector'
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap'
import { useKeyboardState } from '../composables/useKeyboardState'
import { useLayerManager } from '../composables/useLayerManager'
import { useKeyHighlight } from '../composables/useKeyHighlight'
import { useKeyInput } from '../composables/useKeyInput'
import { useKeymapMatcher } from '../composables/useKeymapMatcher'
import { usePracticeMaterial } from '../composables/usePracticeMaterial'
import { useTypingJudge } from '../composables/useTypingJudge'
import KeyboardLayoutView from './KeyboardLayoutView.vue'
import InstructionBanner from './InstructionBanner.vue'
import KeyboardInfo from './KeyboardInfo.vue'
import LayerPanel from './LayerPanel.vue'
import DebugPanel from './DebugPanel.vue'
import PracticeTextDisplay from './PracticeTextDisplay.vue'

// Composables
const { isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector()
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap()
const { selectedKeyboard, error, clearError } = useKeyboardState()
const { toggleLayer, isLayerVisible, showOnlyLayer } = useLayerManager(0)
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

// Typing practice state
const showTypingPractice = ref(false)
const lastInputWasCorrect = ref(true)

// Computed
const layerCount = computed(() => rawHIDData.value?.layerCount ?? 0)
const currentText = computed(() => practiceText.value)
const canGoNextMaterial = computed(() => {
  const currentIndex = materials.value.findIndex((m: any) => m.id === currentMaterial.value?.id)
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

// Keyboard event handlers
function onKeyDown(event: KeyboardEvent) {
  const keyEvent = convertKeyDown(event)
  if (!keyEvent || !rawHIDData.value) return
  
  event.preventDefault()
  const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
  
  matchedKeys.forEach((positions, layer) => {
    pressKeys(layer, positions)
  })

  // タイピング判定処理
  if (showTypingPractice.value && !typingCompleted.value && typingJudge.value) {
    // 入力文字を取得（KeyInputEventからkey属性を使用）
    const inputChar = keyEvent.key
    
    // 英数字1文字のみ判定対象
    if (inputChar.length === 1 && /^[a-zA-Z0-9 ]$/.test(inputChar)) {
      const result = typingJudge.value.judge(inputChar)
      lastInputWasCorrect.value = result.isCorrect
    }
  }
}

function onKeyUp(event: KeyboardEvent) {
  const keyEvent = convertKeyUp(event)
  if (!keyEvent || !rawHIDData.value) return
  
  event.preventDefault()
  const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
  
  matchedKeys.forEach((positions, layer) => {
    releaseKeys(layer, positions)
  })
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}
</style>
