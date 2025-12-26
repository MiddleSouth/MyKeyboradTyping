<template>
  <div class="completion-section py-8 px-6 bg-green-50 border-2 border-green-200 rounded-lg h-[244px] flex flex-col justify-center">
    <!-- 完了アイコンとタイトル -->
    <div class="text-center mb-4">
      <div class="flex items-center justify-center gap-2 mb-3">
        <span class="text-3xl">🎉</span>
        <h3 class="text-xl font-bold text-green-800">完了！</h3>
      </div>
      
      <!-- ステータス表示 -->
      <div class="grid grid-cols-3 gap-3 max-w-md mx-auto mb-4">
        <div class="text-center p-2 bg-white rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-green-600">{{ statistics.correctCount }}</div>
          <div class="text-xs text-gray-600 mt-1">正解</div>
        </div>
        <div class="text-center p-2 bg-white rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-red-600">{{ statistics.incorrectCount }}</div>
          <div class="text-xs text-gray-600 mt-1">ミス</div>
        </div>
        <div class="text-center p-2 bg-white rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-blue-600">{{ statistics.accuracy }}%</div>
          <div class="text-xs text-gray-600 mt-1">正確率</div>
        </div>
      </div>
    </div>
    
    <!-- アクションボタン -->
    <div class="flex gap-3 justify-center">
      <button
        @click="$emit('retry')"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow text-sm"
      >
        もう一度
      </button>
      <button
        @click="$emit('next')"
        :disabled="!canGoNext"
        class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition shadow text-sm"
      >
        次の練習へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TypingStatistics {
  correctCount: number
  incorrectCount: number
  totalInputCount: number
  accuracy: number
}

interface Props {
  statistics: TypingStatistics
  canGoNext: boolean
}

interface Emits {
  (e: 'retry'): void
  (e: 'next'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
