<template>
  <div class="keyboard-select-container">
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">キーボード選択</h1>

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
      <DebugPanel :data="rawHIDData" :show-debug="true" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useKeyboardDetector } from '../composables/useKeyboardDetector'
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap'
import { useKeyboardState } from '../composables/useKeyboardState'
import { useLayerManager } from '../composables/useLayerManager'
import { useKeyHighlight } from '../composables/useKeyHighlight'
import { useKeyInput } from '../composables/useKeyInput'
import { useKeymapMatcher } from '../composables/useKeymapMatcher'
import KeyboardLayoutView from './KeyboardLayoutView.vue'
import InstructionBanner from './InstructionBanner.vue'
import KeyboardInfo from './KeyboardInfo.vue'
import LayerPanel from './LayerPanel.vue'
import DebugPanel from './DebugPanel.vue'

// Composables
const { isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector()
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap()
const { selectedKeyboard, error, clearError } = useKeyboardState()
const { toggleLayer, isLayerVisible, showOnlyLayer } = useLayerManager(0)
const { pressKeys, releaseKeys, getPressedKeys } = useKeyHighlight()
const { handleKeyDown: convertKeyDown, handleKeyUp: convertKeyUp } = useKeyInput()
const { findKeysInAllLayers } = useKeymapMatcher(rawHIDData)

// Computed
const layerCount = computed(() => rawHIDData.value?.layerCount ?? 0)

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

// Keyboard event handlers
function onKeyDown(event: KeyboardEvent) {
  const keyEvent = convertKeyDown(event)
  if (!keyEvent || !rawHIDData.value) return
  
  event.preventDefault()
  const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
  
  matchedKeys.forEach((positions, layer) => {
    pressKeys(layer, positions)
  })
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
