<template>
  <div class="practice-text-display">
    <!-- 日本語の場合：ひらがなとローマ字を縦並び表示 -->
    <div v-if="isJapanese" class="text-content japanese-mode">
      <div class="hiragana-row">
        <span
          v-for="(char, index) in textChars"
          :key="`hiragana-${index}`"
          class="hiragana-char"
        >
          {{ char }}
        </span>
      </div>
      <div class="romaji-row">
        <span
          v-for="(romaji, index) in romajiPatterns"
          :key="`romaji-${index}`"
          :class="getRomajiClass(index)"
          class="romaji-pattern"
        >
          <span
            v-for="(char, charIndex) in romaji.split('')"
            :key="`romaji-char-${charIndex}`"
            :class="getRomajiCharClass(index, charIndex)"
            class="romaji-char"
          >
            {{ char }}
          </span>
        </span>
        <span class="cursor" :class="{ blink: !isCompleted }"></span>
      </div>
    </div>
    
    <!-- 英語の場合：従来通りの表示 -->
    <div v-else class="text-content">
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
        {{ overallCurrent !== undefined ? overallCurrent : currentPosition }} / {{ overallTotal !== undefined ? overallTotal : text.length }}
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
  overallCurrent?: number
  overallTotal?: number
  isJapanese?: boolean
  romajiPatterns?: string[]
  currentRomajiIndex?: number
  currentRomajiPosition?: number
}

const props = withDefaults(defineProps<Props>(), {
  lastInputWasCorrect: null,
  overallCurrent: undefined,
  overallTotal: undefined,
  isJapanese: false,
  romajiPatterns: () => [],
  currentRomajiIndex: 0,
  currentRomajiPosition: 0
})

/**
 * テキストを文字配列に変換（視覚的な表示用）
 */
const textChars = computed(() => {
  return props.text.split('').map(char => {
    if (char === ' ') {
      return '␣' // スペース記号
    } else if (char === '\n') {
      return '↵' // Enterキー記号
    }
    return char
  })
})

/**
 * 進捗率
 */
const progress = computed(() => {
  // 全体の進捗が指定されている場合はそれを使用
  if (props.overallTotal !== undefined && props.overallCurrent !== undefined) {
    if (props.overallTotal === 0) return 0
    return Math.round((props.overallCurrent / props.overallTotal) * 100)
  }
  
  // 指定されていない場合は現在の単語の進捗
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

/**
 * ローマ字パターンのCSSクラスを取得
 */
function getRomajiClass(index: number): string {
  if (index < props.currentRomajiIndex) {
    return 'completed'
  } else if (index === props.currentRomajiIndex) {
    return 'current'
  }
  return 'pending'
}

/**
 * ローマ字の各文字のCSSクラスを取得
 */
function getRomajiCharClass(patternIndex: number, charIndex: number): string {
  if (patternIndex < props.currentRomajiIndex) {
    return 'completed'
  } else if (patternIndex === props.currentRomajiIndex) {
    if (charIndex < props.currentRomajiPosition) {
      return 'completed'
    } else if (charIndex === props.currentRomajiPosition) {
      if (props.lastInputWasCorrect === false) {
        return 'current error'
      }
      return 'current'
    }
    return 'pending'
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

/* 日本語モード：縦並び */
.text-content.japanese-mode {
  flex-direction: column;
  gap: 0.5rem;
}

.hiragana-row {
  font-size: 2.5rem;
  font-weight: 600;
  display: flex;
  gap: 0.5rem;
}

.hiragana-char {
  display: inline-block;
  transition: all 0.2s ease;
  padding: 0 4px;
}

.hiragana-char.completed {
  color: #10b981;
}

.hiragana-char.current {
  color: #3b82f6;
  background: #dbeafe;
  border-radius: 4px;
}

.hiragana-char.pending {
  color: #9ca3af;
}

.romaji-row {
  font-size: 1.25rem;
  color: #6b7280;
  display: flex;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
}

.romaji-pattern {
  display: inline-flex;
}

.romaji-char {
  display: inline-block;
  transition: all 0.2s ease;
  padding: 0 1px;
}

.romaji-char.completed {
  color: #10b981;
  font-weight: 600;
}

.romaji-char.current {
  color: #3b82f6;
  background: #dbeafe;
  border-radius: 4px;
  font-weight: 600;
}

.romaji-char.current.error {
  color: #ef4444;
  background: #fee2e2;
  animation: shake 0.3s ease;
}

.romaji-char.pending {
  color: #9ca3af;
}

.text-char {
  display: inline-block;
  transition: all 0.2s ease;
  padding: 0 1px;
}

/* スペースとEnterキーの特別な表示 */
.text-char:has-text("␣"),
.text-char:has-text("↵") {
  font-weight: 600;
  color: #6b7280;
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
