<script setup lang="ts">
import { computed } from 'vue'
import type { RawKeymapData } from '../types/keyboard'
import { convertKeycodeToLabel } from '../utils/keycodeConverter'
import KeyboardModel from '../utils/KeyboardModel'
import type KeyModel from '../utils/KeyModel'
import { Ergo68Keymap } from '../assets/keymaps/Ergo68Keymap'

interface Props {
  keymapData: RawKeymapData | null
  layer?: number
  pressedKeys?: Set<string> // "row,col" の形式
}

const props = withDefaults(defineProps<Props>(), {
  layer: 0
})

// KeyboardModelを使用してレイアウトを処理
const keyboardModel = new KeyboardModel(Ergo68Keymap)
const layoutData = keyboardModel.getKeymap()

const KEY_PADDING = 4

/**
 * Ergo68のマトリックス座標をVIA配列のインデックスに変換
 * VIAは2つのマトリックス行を1つのVIA行にまとめて保存：
 * - VIA[0, 0-6] = Matrix[0, 0-6]
 * - VIA[0, 7-13] = Matrix[1, 0-6]
 * - VIA[1, 0-6] = Matrix[2, 0-6]
 * - VIA[1, 7-13] = Matrix[3, 0-6]
 * - ...
 * 
 * つまり：
 * - VIA row = Matrix row ÷ 2（整数除算）
 * - VIA col = Matrix row が偶数なら col, 奇数なら col + 7
 */
function convertMatrixToViaIndex(matrixRow: number, matrixCol: number): [number, number] {
  const viaRow = Math.floor(matrixRow / 2)
  const viaCol = (matrixRow % 2 === 0) ? matrixCol : matrixCol + 7
  return [viaRow, viaCol]
}

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
  return {
    width: layoutData.width + KEY_PADDING * 2,
    height: layoutData.height + KEY_PADDING * 2
  }
})

/**
 * 指定されたキーモデルのキーコードを取得
 */
function getKeycodeForPosition(keyModel: KeyModel): number | null {
  if (!props.keymapData || !keyModel.pos) return null
  
  const [matrixRow, matrixCol] = keyModel.pos.split(',').map(Number)
  const [viaRow, viaCol] = convertMatrixToViaIndex(matrixRow, matrixCol)
  const layerData = props.keymapData.keymap_by_layer[props.layer]
  
  if (!layerData || !layerData[viaRow] || layerData[viaRow][viaCol] === undefined) {
    return null
  }
  
  return layerData[viaRow][viaCol]
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
  return {
    x: keyModel.left - layoutData.left + KEY_PADDING,
    y: keyModel.top - layoutData.top + KEY_PADDING,
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
    <!-- キーマップデータがない場合 -->
    <div v-if="!keymapData" class="text-gray-500">
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
