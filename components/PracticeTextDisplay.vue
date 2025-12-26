<template>
  <div class="practice-text-display">
    <div class="text-content">
      <span
        v-for="(char, index) in textChars"
        :key="index"
        :class="getCharClass(index)"
        class="text-char"
      >
        {{ char }}
      </span>
      <span class="cursor" :class="{ blink: !isCompleted }"></span>
    </div>
    
    <div class="progress-info">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">
        {{ currentPosition }} / {{ text.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  currentPosition: number
  isCompleted: boolean
  lastInputWasCorrect?: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  lastInputWasCorrect: null
})

/**
 * テキストを文字配列に変換
 */
const textChars = computed(() => {
  return props.text.split('')
})

/**
 * 進捗率
 */
const progress = computed(() => {
  if (props.text.length === 0) return 0
  return Math.round((props.currentPosition / props.text.length) * 100)
})

/**
 * 文字のCSSクラスを取得
 */
function getCharClass(index: number): string {
  if (index < props.currentPosition) {
    return 'completed'
  } else if (index === props.currentPosition) {
    if (props.lastInputWasCorrect === false) {
      return 'current error'
    }
    return 'current'
  }
  return 'pending'
}
</script>

<style scoped>
.practice-text-display {
  width: 100%;
  min-height: 244px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.text-content {
  font-size: 2rem;
  font-family: 'Courier New', monospace;
  line-height: 1.4;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.text-char {
  display: inline-block;
  transition: all 0.2s ease;
  padding: 0 1px;
}

.text-char.completed {
  color: #10b981;
  font-weight: 600;
}

.text-char.current {
  color: #3b82f6;
  background: #dbeafe;
  border-radius: 4px;
  font-weight: 600;
}

.text-char.current.error {
  color: #ef4444;
  background: #fee2e2;
  animation: shake 0.3s ease;
}

.text-char.pending {
  color: #9ca3af;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.6rem;
  background: #3b82f6;
  margin-left: 2px;
  position: relative;
  top: 4px;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}
</style>
