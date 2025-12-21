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

      <!-- キーボードレイアウト表示 -->
      <div v-if="rawHIDData" class="mt-6">
        <KeyboardLayoutView :keymapData="rawHIDData" :layer="0" />
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
import { computed } from 'vue';
import { useKeyboardDetector } from '../composables/useKeyboardDetector';
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap';
import { useKeyboardState } from '../composables/useKeyboardState';
import KeyboardLayoutView from './KeyboardLayoutView.vue';
const { keyboards, isLoading: isDetecting, requestKeyboardSelection } = useKeyboardDetector();
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap();
const { selectedKeyboard, error, clearError } = useKeyboardState();

const rawDataDisplay = computed(() => {
  if (!rawHIDData.value) {
    return '';
  }
  return JSON.stringify(rawHIDData.value, null, 2);
});

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
}
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}
</style>
