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

      <!-- 生データ表示 -->
      <div v-if="rawDataDisplay" class="mt-6">
        <h2 class="text-xl font-bold mb-4">取得した生データ</h2>
        <div class="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <pre class="text-green-400 font-mono text-sm">{{ rawDataDisplay }}</pre>
        </div>
      </div>

      <!-- デバッグ情報 -->
      <div v-if="debugInfo" class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <h2 class="text-lg font-bold mb-3">デバッグ情報</h2>
        <pre class="text-sm overflow-auto">{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useKeyboardDetector } from '../composables/useKeyboardDetector';
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap';
import type { KeyboardDevice } from '../types/keyboard';

const router = useRouter();
const { keyboards, isLoading: isDetecting, error, detectKeyboards, requestKeyboardSelection } = useKeyboardDetector();
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap();

const selectedKeyboard = ref<KeyboardDevice | null>(null);
const debugInfo = ref<string>('');

const rawDataDisplay = computed(() => {
  if (!rawHIDData.value) {
    return '';
  }
  return JSON.stringify(rawHIDData.value, null, 2);
});

async function handleSelectAndFetch() {
  try {
    // キーボード選択ダイアログを表示
    const device = await requestKeyboardSelection();
    
    if (!device) {
      debugInfo.value = 'キーボードが選択されませんでした';
      return;
    }
    
    // 選択されたキーボードをセット
    selectedKeyboard.value = device;
    
    // 自動的にキーマップを取得
    await handleContinue();
  } catch (err) {
    debugInfo.value = `❌ エラーが発生しました\n${err}`;
    console.error('キーボード選択・接続エラー:', err);
  }
}

async function handleContinue() {
  if (!selectedKeyboard.value) return;

  try {
    debugInfo.value = `キーマップ取得中...\nキーボード: ${selectedKeyboard.value.productName}\nVID: 0x${selectedKeyboard.value.vendorId.toString(16).toUpperCase().padStart(4, '0')}\nPID: 0x${selectedKeyboard.value.productId.toString(16).toUpperCase().padStart(4, '0')}`;

    // キーマップを取得
    const keymap = await fetchKeymap(selectedKeyboard.value);

    if (keymap) {
      debugInfo.value = `✅ キーマップ取得成功\n\nキーボード: ${selectedKeyboard.value.productName}\nVID: 0x${selectedKeyboard.value.vendorId.toString(16).toUpperCase().padStart(4, '0')}\nPID: 0x${selectedKeyboard.value.productId.toString(16).toUpperCase().padStart(4, '0')}\n\n取得時刻: ${new Date().toLocaleString('ja-JP')}`;
    } else {
      debugInfo.value = `❌ キーマップ取得失敗\n詳細はコンソールを確認してください`;
    }
  } catch (err) {
    debugInfo.value = `❌ エラーが発生しました\n${err}`;
    console.error('キーマップ取得エラー:', err);
  }
}
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}
</style>
