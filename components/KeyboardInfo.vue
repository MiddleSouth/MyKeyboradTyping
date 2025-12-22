<template>
  <div v-if="keyboard" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <h2 class="text-lg font-bold mb-2 text-green-800">✓ 選択済みのキーボード</h2>
    <div class="text-sm text-green-900">
      <p class="font-bold">{{ keyboard.productName }}</p>
      <p>VID: {{ formatHex(keyboard.vendorId) }}</p>
      <p>PID: {{ formatHex(keyboard.productId) }}</p>
    </div>
    
    <!-- スロットで追加のアクションボタンなどを挿入可能 -->
    <div v-if="$slots.actions" class="mt-3">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KeyboardDevice } from '../types/keyboard'

interface Props {
  keyboard: KeyboardDevice | null
}

defineProps<Props>()

/**
 * 16進数フォーマット（VID/PID表示用）
 */
function formatHex(value: number): string {
  return '0x' + value.toString(16).toUpperCase().padStart(4, '0')
}
</script>
