<template>
  <div class="keyboard-select-container">
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">キーボード選択</h1>

      <!-- 説明文 -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p>
          <strong>「キーボードを選択」ボタンをクリック</strong>すると、デバイス選択ダイアログが表示されます。
          キーボードを選択すると、自動的に接続してキーマップを取得します。
        </p>
      </div>

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
      <div v-if="selectedKeyboard" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2 text-green-800">✓ 選択済みのキーボード</h2>
        <div class="text-sm text-green-900">
          <p class="font-bold">{{ selectedKeyboard.productName }}</p>
          <p>VID: {{ '0x' + selectedKeyboard.vendorId.toString(16).toUpperCase().padStart(4, '0') }}</p>
          <p>PID: {{ '0x' + selectedKeyboard.productId.toString(16).toUpperCase().padStart(4, '0') }}</p>
        </div>
        
        <!-- デバッグ用：キーマップ再取得ボタン -->
        <div class="mt-3">
          <button
            @click="handleContinue"
            :disabled="isLoading"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium transition"
          >
            {{ isLoading ? 'キーマップ取得中...' : '🔄 キーマップを再取得（デバッグ用）' }}
          </button>
        </div>
      </div>

      <!-- キーボードレイアウト表示（全レイヤー） -->
      <div v-if="rawHIDData" class="mt-6">
        <h2 class="text-2xl font-bold mb-4">キーマップ - 全レイヤー</h2>
        
        <div v-for="layerNum in layerCount" :key="layerNum - 1" class="mb-6">
          <!-- レイヤーヘッダー（クリックで展開/折りたたみ） -->
          <button
            @click="toggleLayer(layerNum - 1)"
            class="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-t-lg transition"
          >
            <span class="text-lg font-bold">
              {{ visibleLayers.has(layerNum - 1) ? '▼' : '▶' }} 
              レイヤー {{ layerNum - 1 }}
            </span>
            <span class="text-sm text-gray-600">
              {{ visibleLayers.has(layerNum - 1) ? '表示中' : 'クリックして表示' }}
            </span>
          </button>
          
          <!-- レイヤーコンテンツ -->
          <div 
            v-show="visibleLayers.has(layerNum - 1)"
            class="border border-t-0 border-gray-300 rounded-b-lg p-4 bg-white"
          >
            <KeyboardLayoutView 
              :keymapData="rawHIDData" 
              :layer="layerNum - 1"
              :pressedKeys="pressedKeysByLayer.get(layerNum - 1)"
            />
          </div>
        </div>
      </div>

      <!-- 生データ表示 -->
      <div v-if="rawDataDisplay" class="mt-6">
        <h2 class="text-xl font-bold mb-4">取得した生データ</h2>
        <div class="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <pre class="text-green-400 font-mono text-sm">{{ rawDataDisplay }}</pre>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useKeyboardDetector } from '../composables/useKeyboardDetector';
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap';
import { useKeyboardState } from '../composables/useKeyboardState';
import KeyboardLayoutView from './KeyboardLayoutView.vue';

const { isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector();
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap();
const { selectedKeyboard, error, clearError } = useKeyboardState();

// 表示中のレイヤーを管理（Setで管理）
const visibleLayers = ref(new Set<number>([0])); // 初期状態でレイヤー0のみ表示

// 押されているキーのマトリックス位置を管理（レイヤーごと）
const pressedKeysByLayer = ref(new Map<number, Set<string>>()); // layer → Set<"row,col">

// 物理キーコードからQMKキーコードへのマッピング
const PHYSICAL_KEY_TO_QMK: Record<string, number> = {
  // 文字キー A-Z
  'KeyA': 0x0004,
  'KeyB': 0x0005,
  'KeyC': 0x0006,
  'KeyD': 0x0007,
  'KeyE': 0x0008,
  'KeyF': 0x0009,
  'KeyG': 0x000A,
  'KeyH': 0x000B,
  'KeyI': 0x000C,
  'KeyJ': 0x000D,
  'KeyK': 0x000E,
  'KeyL': 0x000F,
  'KeyM': 0x0010,
  'KeyN': 0x0011,
  'KeyO': 0x0012,
  'KeyP': 0x0013,
  'KeyQ': 0x0014,
  'KeyR': 0x0015,
  'KeyS': 0x0016,
  'KeyT': 0x0017,
  'KeyU': 0x0018,
  'KeyV': 0x0019,
  'KeyW': 0x001A,
  'KeyX': 0x001B,
  'KeyY': 0x001C,
  'KeyZ': 0x001D,
  
  // 数字キー 1-0
  'Digit1': 0x001E,
  'Digit2': 0x001F,
  'Digit3': 0x0020,
  'Digit4': 0x0021,
  'Digit5': 0x0022,
  'Digit6': 0x0023,
  'Digit7': 0x0024,
  'Digit8': 0x0025,
  'Digit9': 0x0026,
  'Digit0': 0x0027,
  
  // 特殊キー
  'Enter': 0x0028,
  'Escape': 0x0029,
  'Backspace': 0x002A,
  'Tab': 0x002B,
  'Space': 0x002C,
  'Minus': 0x002D,
  'Equal': 0x002E,
  'BracketLeft': 0x002F,
  'BracketRight': 0x0030,
  'Backslash': 0x0031,
  'Semicolon': 0x0033,
  'Quote': 0x0034,
  'Backquote': 0x0035,
  'Comma': 0x0036,
  'Period': 0x0037,
  'Slash': 0x0038,
  'CapsLock': 0x0039,
  
  // ファンクションキー
  'F1': 0x003A,
  'F2': 0x003B,
  'F3': 0x003C,
  'F4': 0x003D,
  'F5': 0x003E,
  'F6': 0x003F,
  'F7': 0x0040,
  'F8': 0x0041,
  'F9': 0x0042,
  'F10': 0x0043,
  'F11': 0x0044,
  'F12': 0x0045,
  
  // システムキー
  'PrintScreen': 0x0046,
  'ScrollLock': 0x0047,
  'Pause': 0x0048,
  'Insert': 0x0049,
  'Home': 0x004A,
  'PageUp': 0x004B,
  'Delete': 0x004C,
  'End': 0x004D,
  'PageDown': 0x004E,
  
  // 矢印キー
  'ArrowRight': 0x004F,
  'ArrowLeft': 0x0050,
  'ArrowDown': 0x0051,
  'ArrowUp': 0x0052,
  
  // モディファイアキー
  'ControlLeft': 0x00E0,
  'ShiftLeft': 0x00E1,
  'AltLeft': 0x00E2,
  'MetaLeft': 0x00E3,
  'ControlRight': 0x00E4,
  'ShiftRight': 0x00E5,
  'AltRight': 0x00E6,
  'MetaRight': 0x00E7,
}

/**
 * 指定されたレイヤー内で、指定されたQMKキーコードを持つすべてのマトリックス位置を取得
 */
function findKeysWithKeycodeInLayer(keycode: number, layer: number): Set<string> {
  const result = new Set<string>()
  
  if (!rawHIDData.value) {
    return result
  }
  
  const layerData = rawHIDData.value.keymap_by_layer[layer]
  if (!layerData) {
    return result
  }
  
  // 各行・列を走査
  for (let row = 0; row < layerData.length; row++) {
    for (let col = 0; col < layerData[row].length; col++) {
      if (layerData[row][col] === keycode) {
        result.add(`${row},${col}`)
      }
    }
  }
  
  return result
}

// レイヤー数を計算
const layerCount = computed(() => {
  if (!rawHIDData.value) return 0;
  return rawHIDData.value.layerCount;
});

const rawDataDisplay = computed(() => {
  if (!rawHIDData.value) {
    return '';
  }
  return JSON.stringify(rawHIDData.value, null, 2);
});

/**
 * レイヤーの表示・非表示を切り替え
 */
function toggleLayer(layer: number) {
  if (visibleLayers.value.has(layer)) {
    visibleLayers.value.delete(layer);
  } else {
    visibleLayers.value.add(layer);
  }
  // Setの変更を検知させるため、新しいSetを作成
  visibleLayers.value = new Set(visibleLayers.value);
}

/**
 * キーボード入力イベントハンドラー
 */
function handleKeyDown(event: KeyboardEvent) {
  const code = event.code
  const qmkKeycode = PHYSICAL_KEY_TO_QMK[code]
  
  console.log('[KeyDown]', {
    code,
    key: event.key,
    qmkKeycode: qmkKeycode ? `0x${qmkKeycode.toString(16).toUpperCase().padStart(4, '0')}` : 'not mapped'
  })
  
  if (!qmkKeycode) {
    console.log(`  ⚠ Key "${code}" is not mapped to QMK keycode`)
    return
  }
  
  // スクロールを防ぐため、デフォルト動作を無効化
  event.preventDefault()
  
  if (!rawHIDData.value) {
    return
  }
  
  // 各レイヤーごとに該当するキーを検索
  const newPressedKeysByLayer = new Map<number, Set<string>>()
  for (let layer = 0; layer < rawHIDData.value.layerCount; layer++) {
    const matchingPositions = findKeysWithKeycodeInLayer(qmkKeycode, layer)
    if (matchingPositions.size > 0) {
      // 既存の押されているキーに追加
      const existingKeys = pressedKeysByLayer.value.get(layer) || new Set<string>()
      matchingPositions.forEach(pos => existingKeys.add(pos))
      newPressedKeysByLayer.set(layer, existingKeys)
      
      console.log(`  ✓ Layer ${layer}: Found ${matchingPositions.size} position(s):`, Array.from(matchingPositions))
    } else {
      // 既存のキーを保持
      const existingKeys = pressedKeysByLayer.value.get(layer)
      if (existingKeys) {
        newPressedKeysByLayer.set(layer, existingKeys)
      }
    }
  }
  
  pressedKeysByLayer.value = newPressedKeysByLayer
}

function handleKeyUp(event: KeyboardEvent) {
  const code = event.code
  const qmkKeycode = PHYSICAL_KEY_TO_QMK[code]
  
  console.log('[KeyUp]', {
    code,
    key: event.key,
    qmkKeycode: qmkKeycode ? `0x${qmkKeycode.toString(16).toUpperCase().padStart(4, '0')}` : 'not mapped'
  })
  
  if (!qmkKeycode) {
    return
  }
  
  // スクロールを防ぐため、デフォルト動作を無効化
  event.preventDefault()
  
  if (!rawHIDData.value) {
    return
  }
  
  // 各レイヤーごとに該当するキーを削除
  const newPressedKeysByLayer = new Map<number, Set<string>>()
  for (let layer = 0; layer < rawHIDData.value.layerCount; layer++) {
    const matchingPositions = findKeysWithKeycodeInLayer(qmkKeycode, layer)
    const existingKeys = pressedKeysByLayer.value.get(layer)
    
    if (existingKeys) {
      const updatedKeys = new Set(existingKeys)
      matchingPositions.forEach(pos => updatedKeys.delete(pos))
      
      if (updatedKeys.size > 0) {
        newPressedKeysByLayer.set(layer, updatedKeys)
      }
      
      console.log(`  ✓ Layer ${layer}: Released ${matchingPositions.size} position(s)`)
    }
  }
  
  pressedKeysByLayer.value = newPressedKeysByLayer
}

// コンポーネントマウント時にイベントリスナーを追加
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

// アンマウント時にイベントリスナーを削除
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})

async function handleSelectAndFetch() {
  // ユーザーアクション時に前回のエラーをクリア
  clearError();
  
  // キーボード選択ダイアログを表示
  const device = await requestKeyboardSelection();
  
  if (!device) {
    return;
  }
  
  // 自動的にキーマップを取得
  await handleContinue();
}

async function handleContinue() {
  if (!selectedKeyboard.value) return;

  // キーマップを取得（エラーはcomposable側で処理）
  await fetchKeymap(selectedKeyboard.value);
  
  // レイヤー表示を初期化（レイヤー0のみ）
  visibleLayers.value = new Set([0]);
}
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}
</style>
