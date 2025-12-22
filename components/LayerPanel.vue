<template>
  <div class="mb-6">
    <!-- レイヤーヘッダー（クリックで展開/折りたたみ） -->
    <button
      @click="handleToggle"
      class="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-t-lg transition"
    >
      <span class="text-lg font-bold">
        {{ isVisible ? '▼' : '▶' }} 
        レイヤー {{ layerNumber }}
      </span>
      <span class="text-sm text-gray-600">
        {{ isVisible ? '表示中' : 'クリックして表示' }}
      </span>
    </button>
    
    <!-- レイヤーコンテンツ -->
    <div 
      v-show="isVisible"
      class="border border-t-0 border-gray-300 rounded-b-lg p-4 bg-white"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  layerNumber: number
  isVisible: boolean
}

interface Emits {
  (e: 'toggle'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleToggle() {
  emit('toggle')
}
</script>
