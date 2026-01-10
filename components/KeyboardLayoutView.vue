<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RawKeymapData } from '../types/keyboard'
import { convertKeycodeToLabel } from '../utils/keycodeConverter'
import KeyboardModel from '../utils/KeyboardModel'
import type KeyModel from '../utils/KeyModel'
import { findKeyboardByProductName } from '../utils/keyboardLoader'

interface Props {
  keymapData: RawKeymapData | null
  layer?: number
  pressedKeys?: Set<string> // "row,col" の形式
}

const props = withDefaults(defineProps<Props>(), {
  layer: 0
})

// キーボードレイアウトデータ（非同期で読み込む）
const layoutData = ref<any | null>(null)
const isLoadingLayout = ref(true)

// キーボード定義を動的に読み込む
async function loadKeyboardDefinition() {
  if (!props.keymapData) {
    isLoadingLayout.value = false
    return
  }
  
  try {
    isLoadingLayout.value = true
    const keyboardDef = await findKeyboardByProductName(props.keymapData.productName)
    
    if (!keyboardDef) {
      console.warn(`キーボード定義が見つかりません: ${props.keymapData.productName}`)
      isLoadingLayout.value = false
      return
    }
    
    const keyboardModel = new KeyboardModel(keyboardDef.layout)
    layoutData.value = keyboardModel.getKeymap()
    isLoadingLayout.value = false
  } catch (error) {
    console.error('キーボード定義の読み込みエラー:', error)
    isLoadingLayout.value = false
  }
}

// keymapDataが変更されたらレイアウトを再読み込み
watch(() => props.keymapData, () => {
  loadKeyboardDefinition()
}, { immediate: true })

const KEY_PADDING = 4

/**
 * 指定されたキーが押されているかチェック
 */
function isKeyPressed(pos: string): boolean {
  if (!props.pressedKeys) return false
  return props.pressedKeys.has(pos)
}

/**
 * SVG全体のサイズを計算
 */
const svgDimensions = computed(() => {
  if (!layoutData.value) {
    return { width: 800, height: 400 }
  }
  return {
    width: layoutData.value.width + KEY_PADDING * 2,
    height: layoutData.value.height + KEY_PADDING * 2
  }
})

/**
 * 指定されたキーモデルのキーコードを取得
 */
function getKeycodeForPosition(keyModel: KeyModel): number | null {
  if (!props.keymapData || !keyModel.pos) return null
  
  const [row, col] = keyModel.pos.split(',').map(Number)
  const layerData = props.keymapData.keymap_by_layer[props.layer]
  
  if (!layerData || !layerData[row] || layerData[row][col] === undefined) {
    return null
  }
  
  return layerData[row][col]
}

/**
 * キーコードをラベルに変換
 */
function getKeyLabel(keyModel: KeyModel): string {
  const keycode = getKeycodeForPosition(keyModel)
  if (keycode === null) return '?'
  return convertKeycodeToLabel(keycode)
}

/**
 * キーラベルを行に分割（改行対応）
 */
function getKeyLabelLines(keyModel: KeyModel): string[] {
  const label = getKeyLabel(keyModel)
  return label.split('\n')
}

/**
 * キーのSVG座標を計算
 */
function getKeyRect(keyModel: KeyModel) {
  if (!layoutData.value) {
    return { x: 0, y: 0, width: 50, height: 50 }
  }
  return {
    x: keyModel.left - layoutData.value.left + KEY_PADDING,
    y: keyModel.top - layoutData.value.top + KEY_PADDING,
    width: keyModel.width,
    height: keyModel.height
  }
}

/**
 * テキストの位置を計算（キーの中央）
 */
function getTextPosition(keyModel: KeyModel) {
  const rect = getKeyRect(keyModel)
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}
</script>

<template>
  <div class="keyboard-layout-view">
    <!-- レイアウト読み込み中 -->
    <div v-if="isLoadingLayout" class="text-gray-500">
      キーボードレイアウトを読み込み中...
    </div>
    
    <!-- キーマップデータがない場合 -->
    <div v-else-if="!keymapData" class="text-gray-500">
      キーマップデータがありません。キーボードを接続してください。
    </div>
    
    <!-- レイアウトデータがない場合 -->
    <div v-else-if="!layoutData" class="text-gray-500">
      キーボードレイアウトが見つかりません。
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
      <g 
        v-for="(keyModel, index) in layoutData.keymaps" 
        :key="index" 
        class="key-group"
        :transform="keyModel.rotate !== 0 
          ? `rotate(${keyModel.rotate}, ${keyModel.originLeft - layoutData.left + KEY_PADDING}, ${keyModel.originTop - layoutData.top + KEY_PADDING})`
          : undefined"
      >
        <!-- デカールキー（表示のみで機能しない装飾キー）はスキップ -->
        <template v-if="!keyModel.isDecal && keyModel.pos">
          <!-- キーキャップの矩形 -->
          <rect
            :x="getKeyRect(keyModel).x"
            :y="getKeyRect(keyModel).y"
            :width="getKeyRect(keyModel).width"
            :height="getKeyRect(keyModel).height"
            rx="4"
            :fill="isKeyPressed(keyModel.pos) ? '#fbbf24' : 'white'"
            stroke="#9ca3af"
            stroke-width="2"
            class="key-cap"
          />
          
          <!-- キーラベル（複数行対応） -->
          <text
            :x="getTextPosition(keyModel).x"
            :y="getTextPosition(keyModel).y"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#1f2937"
            font-family="monospace"
            font-size="14"
            font-weight="600"
            class="key-label"
          >
            <tspan
              v-for="(line, lineIndex) in getKeyLabelLines(keyModel)"
              :key="lineIndex"
              :x="getTextPosition(keyModel).x"
              :dy="lineIndex === 0 ? (getKeyLabelLines(keyModel).length === 1 ? 0 : -7) : 14"
            >
              {{ line }}
            </tspan>
          </text>
        </template>
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
