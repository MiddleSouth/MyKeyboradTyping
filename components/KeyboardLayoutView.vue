<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { KeyboardLayout, KeyPosition, RawKeymapData } from '../types/keyboard'
import { convertKeycodeToLabel } from '../utils/keycodeConverter'

interface Props {
  keymapData: RawKeymapData | null
  layer?: number
  pressedKeys?: Set<string> // "row,col" の形式
}

const props = withDefaults(defineProps<Props>(), {
  layer: 0
})

// レイアウトデータ
const layout = ref<KeyboardLayout | null>(null)
const error = ref<string | null>(null)

// SVGのサイズ設定（1u = 50px）
const KEY_UNIT = 50
const KEY_PADDING = 4

/**
 * 指定されたキーが押されているかチェック
 */
function isKeyPressed(matrix: [number, number]): boolean {
  if (!props.pressedKeys) return false
  const [row, col] = matrix
  return props.pressedKeys.has(`${row},${col}`)
}

/**
 * レイアウトJSONを読み込み
 */
onMounted(async () => {
  try {
    const response = await fetch('/keyboards/ergo68-layout.json')
    if (!response.ok) {
      throw new Error('Failed to load keyboard layout')
    }
    layout.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    console.error('Failed to load keyboard layout:', e)
  }
})

/**
 * SVG全体のサイズを計算
 */
const svgDimensions = computed(() => {
  if (!layout.value) return { width: 0, height: 0 }
  
  let maxX = 0
  let maxY = 0
  
  for (const key of layout.value.layout) {
    const keyWidth = (key.w || 1) * KEY_UNIT
    const keyHeight = (key.h || 1) * KEY_UNIT
    maxX = Math.max(maxX, key.x * KEY_UNIT + keyWidth)
    maxY = Math.max(maxY, key.y * KEY_UNIT + keyHeight)
  }
  
  return {
    width: maxX + KEY_PADDING * 2,
    height: maxY + KEY_PADDING * 2
  }
})

/**
 * 指定されたキー位置のキーコードを取得
 */
function getKeycodeForPosition(pos: KeyPosition): number | null {
  if (!props.keymapData) return null
  
  const [row, col] = pos.matrix
  const layerData = props.keymapData.keymap_by_layer[props.layer]
  
  if (!layerData || !layerData[row] || layerData[row][col] === undefined) {
    return null
  }
  
  return layerData[row][col]
}

/**
 * キーコードをラベルに変換
 */
function getKeyLabel(pos: KeyPosition): string {
  const keycode = getKeycodeForPosition(pos)
  if (keycode === null) return '?'
  return convertKeycodeToLabel(keycode)
}

/**
 * キーラベルを行に分割（改行対応）
 */
function getKeyLabelLines(pos: KeyPosition): string[] {
  const label = getKeyLabel(pos)
  return label.split('\n')
}

/**
 * キーのSVG座標を計算
 */
function getKeyRect(pos: KeyPosition) {
  const x = pos.x * KEY_UNIT + KEY_PADDING
  const y = pos.y * KEY_UNIT + KEY_PADDING
  const width = (pos.w || 1) * KEY_UNIT - KEY_PADDING
  const height = (pos.h || 1) * KEY_UNIT - KEY_PADDING
  
  return { x, y, width, height }
}

/**
 * テキストの位置を計算（キーの中央）
 */
function getTextPosition(pos: KeyPosition) {
  const rect = getKeyRect(pos)
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}
</script>

<template>
  <div class="keyboard-layout-view">
    <!-- エラー表示 -->
    <div v-if="error" class="text-red-500 mb-4">
      エラー: {{ error }}
    </div>
    
    <!-- ローディング表示 -->
    <div v-else-if="!layout" class="text-gray-500">
      レイアウトデータを読み込み中...
    </div>
    
    <!-- キーマップデータがない場合 -->
    <div v-else-if="!keymapData" class="text-gray-500">
      キーマップデータがありません。キーボードを接続してください。
    </div>
    
    <!-- SVGキーボード描画 -->
    <svg
      v-else
      :width="svgDimensions.width"
      :height="svgDimensions.height"
      class="border border-gray-300 rounded-lg bg-gray-50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 各キーを描画 -->
      <g v-for="(keyPos, index) in layout.layout" :key="index" class="key-group">
        <!-- キーキャップの矩形 -->
        <rect
          :x="getKeyRect(keyPos).x"
          :y="getKeyRect(keyPos).y"
          :width="getKeyRect(keyPos).width"
          :height="getKeyRect(keyPos).height"
          rx="4"
          :fill="isKeyPressed(keyPos.matrix) ? '#fbbf24' : 'white'"
          stroke="#9ca3af"
          stroke-width="2"
          class="key-cap"
        />
        
        <!-- キーラベル（複数行対応） -->
        <text
          :x="getTextPosition(keyPos).x"
          :y="getTextPosition(keyPos).y"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#1f2937"
          font-family="monospace"
          font-size="14"
          font-weight="600"
          class="key-label"
        >
          <tspan
            v-for="(line, lineIndex) in getKeyLabelLines(keyPos)"
            :key="lineIndex"
            :x="getTextPosition(keyPos).x"
            :dy="lineIndex === 0 ? (getKeyLabelLines(keyPos).length === 1 ? 0 : -7) : 14"
          >
            {{ line }}
          </tspan>
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.keyboard-layout-view {
  padding: 1rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

svg text {
  user-select: none;
}

.key-group {
  cursor: pointer;
}

.key-label {
  pointer-events: none;
}

.matrix-label {
  pointer-events: none;
}
</style>
