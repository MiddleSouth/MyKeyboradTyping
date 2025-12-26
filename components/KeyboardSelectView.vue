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
          <div v-else class="completion-section py-8 px-6 bg-green-50 border-2 border-green-200 rounded-lg h-[244px] flex flex-col justify-center">
            <!-- 完了アイコンとタイトル -->
            <div class="text-center mb-4">
              <div class="flex items-center justify-center gap-2 mb-3">
                <span class="text-3xl">🎉</span>
                <h3 class="text-xl font-bold text-green-800">完了！</h3>
              </div>
              
              <!-- ステータス表示 -->
              <div class="grid grid-cols-3 gap-3 max-w-md mx-auto mb-4">
                <div class="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl font-bold text-green-600">{{ typingStatistics.correctCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">正解</div>
                </div>
                <div class="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl font-bold text-red-600">{{ typingStatistics.incorrectCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">ミス</div>
                </div>
                <div class="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl font-bold text-blue-600">{{ typingStatistics.accuracy }}%</div>
                  <div class="text-xs text-gray-600 mt-1">正確率</div>
                </div>
              </div>
            </div>
            
            <!-- アクションボタン -->
            <div class="flex gap-3 justify-center">
              <button
                @click="handleRetryTyping"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow text-sm"
              >
                もう一度
              </button>
              <button
                @click="handleNextMaterial"
                :disabled="!canGoNextMaterial"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition shadow text-sm"
              >
                次の練習へ
              </button>
            </div>
          </div>
        </div>

        <!-- キーボードレイアウト表示 -->
        <div class="mb-4">
          <!-- レイヤー選択タブ -->
          <div class="mb-4 flex justify-center">
            <div class="inline-flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                v-for="layerNum in layerCount"
                :key="layerNum - 1"
                @click="selectedLayer = layerNum - 1"
                :class="[
                  'px-6 py-2.5 font-medium text-sm transition-colors duration-200',
                  selectedLayer === layerNum - 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                L{{ layerNum - 1 }}
              </button>
            </div>
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
import DebugPanel from './DebugPanel.vue'
import PracticeTextDisplay from './PracticeTextDisplay.vue'

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

// Typing practice state
const showTypingPractice = ref(false)
const lastInputWasCorrect = ref(true)
const selectedLayer = ref(0)
const selectedMaterialId = ref(currentMaterial.value?.id || materials.value[0]?.id || '')

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
    console.log('[Debug] Selected keyboard:', device)
    await handleContinue()
  }
}

async function handleContinue() {
  if (!selectedKeyboard.value) return
  await fetchKeymap(selectedKeyboard.value)
  // レイヤー表示を初期化（レイヤー0のみ）
  showOnlyLayer(0)
  // タイピング練習画面を自動表示
  showTypingPractice.value = true
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

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
</style>
