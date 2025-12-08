<template>
  <div class="keyboard-select-container">
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">キーボード選択</h1>

      <!-- デバイス検出ボタン -->
      <div class="mb-6">
        <button
          @click="handleDetectKeyboards"
          :disabled="isDetecting"
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
        >
          {{ isDetecting ? 'デバイス検出中...' : 'キーボードを検出' }}
        </button>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p class="font-bold">エラー:</p>
        <p>{{ error }}</p>
      </div>

      <!-- キーボード一覧 -->
      <div v-if="keyboards.length > 0" class="mb-6">
        <h2 class="text-xl font-bold mb-4">検出されたキーボード</h2>
        <div class="space-y-3">
          <div
            v-for="keyboard in keyboards"
            :key="`${keyboard.vendorId}-${keyboard.productId}`"
            @click="selectKeyboard(keyboard)"
            :class="[
              'p-4 border-2 rounded-lg cursor-pointer transition',
              selectedKeyboard?.vendorId === keyboard.vendorId &&
              selectedKeyboard?.productId === keyboard.productId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
            ]"
          >
            <div class="flex items-center">
              <input
                type="radio"
                :checked="
                  selectedKeyboard?.vendorId === keyboard.vendorId &&
                  selectedKeyboard?.productId === keyboard.productId
                "
                @change="selectKeyboard(keyboard)"
                class="mr-3"
              />
              <div>
                <p class="font-bold">{{ keyboard.productName }}</p>
                <p class="text-sm text-gray-600">
                  VID: {{ '0x' + keyboard.vendorId.toString(16).toUpperCase().padStart(4, '0') }}
                  PID: {{ '0x' + keyboard.productId.toString(16).toUpperCase().padStart(4, '0') }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  状態: {{ keyboard.isConnected ? '接続済み' : '未接続' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- キーボードなしの場合 -->
      <div v-else-if="!isDetecting" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-800">
          キーボードが検出されていません。Remap対応キーボードを接続してください。
        </p>
      </div>

      <!-- 次へボタン -->
      <div class="flex gap-3">
        <button
          @click="handleContinue"
          :disabled="!selectedKeyboard || isLoading"
          class="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex-1"
        >
          {{ isLoading ? 'キーマップ取得中...' : '次へ進む' }}
        </button>
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
const { keyboards, isLoading: isDetecting, error, detectKeyboards } = useKeyboardDetector();
const { isLoading, fetchKeymap, rawHIDData } = useKeyboardKeymap();

const selectedKeyboard = ref<KeyboardDevice | null>(null);

async function handleDetectKeyboards() {
  await detectKeyboards();
}

function selectKeyboard(keyboard: KeyboardDevice) {
  selectedKeyboard.value = keyboard;
}

async function handleContinue() {
  if (!selectedKeyboard.value) return;

  // キーマップを取得
  const keymap = await fetchKeymap(selectedKeyboard.value);

  // デバッグ画面に遷移（キーマップを表示するため）
  await router.push({
    path: `/keymap-debug/${selectedKeyboard.value.vendorId}/${selectedKeyboard.value.productId}`,
  });
}
</script>

<style scoped>
.keyboard-select-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}
</style>
