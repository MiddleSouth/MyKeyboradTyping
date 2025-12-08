<template>
  <div class="keymap-debug-container">
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">キーマップデータ（デバッグ）</h1>
        <button
          @click="handleBack"
          class="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
        >
          戻る
        </button>
      </div>

      <!-- キーボード情報 -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2">接続キーボード</h2>
        <p class="text-gray-700">
          <span class="font-semibold">{{ keyboardName }}</span>
          <br />
          <span class="text-sm text-gray-600">
            VID: {{ vendorIdHex }} / PID: {{ productIdHex }}
          </span>
        </p>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p class="font-bold">エラー:</p>
        <p>{{ error }}</p>
      </div>

      <!-- ローディング状態 -->
      <div v-if="isLoading" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-800">キーマップを取得中...</p>
      </div>

      <!-- 生データ表示 -->
      <div v-if="rawDataDisplay" class="mb-6">
        <h2 class="text-lg font-bold mb-3">取得した生データ</h2>
        <div class="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <pre class="text-green-400 font-mono text-sm">{{ rawDataDisplay }}</pre>
        </div>
      </div>

      <!-- キーマップ情報 -->
      <div v-if="keymapData" class="mb-6">
        <h2 class="text-lg font-bold mb-3">解析済みキーマップ</h2>
        <div class="space-y-4">
          <!-- キーボード情報 -->
          <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 class="font-semibold mb-2">キーボード情報</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li><span class="font-medium">ID:</span> {{ keymapData.keyboard.id }}</li>
              <li><span class="font-medium">Name:</span> {{ keymapData.keyboard.name }}</li>
            </ul>
          </div>

          <!-- レイヤー情報 -->
          <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 class="font-semibold mb-2">レイヤー</h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(layerData, layerNum) in keymapData.layers"
                :key="`layer-${layerNum}`"
                class="p-3 bg-white border border-gray-300 rounded"
              >
                <p class="font-medium">レイヤー {{ layerNum }}</p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ layerData.length }} 行
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 実装中メッセージ -->
      <div v-if="!isLoading && !rawDataDisplay" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-800">
          キーマップの取得処理を実装中です。現在は基本的なデバイス情報を表示しています。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useKeyboardDetector } from '../composables/useKeyboardDetector';
import { useKeyboardKeymap } from '../composables/useKeyboardKeymap';

const router = useRouter();
const route = useRoute();
const { keyboards } = useKeyboardDetector();
const { keymapData, isLoading, error, rawHIDData, getRawDataForDisplay } = useKeyboardKeymap();

const vendorId = computed(() => parseInt(String(route.params.vendorId), 10));
const productId = computed(() => parseInt(String(route.params.productId), 10));

const vendorIdHex = computed(() => '0x' + vendorId.value.toString(16).toUpperCase().padStart(4, '0'));
const productIdHex = computed(() => '0x' + productId.value.toString(16).toUpperCase().padStart(4, '0'));

const keyboardName = computed(() => {
  const keyboard = keyboards.value.find(
    (kb) => kb.vendorId === vendorId.value && kb.productId === productId.value
  );
  return keyboard?.productName || 'Unknown Keyboard';
});

const rawDataDisplay = computed(() => {
  return getRawDataForDisplay();
});

function handleBack() {
  router.push('/');
}

onMounted(() => {
  console.log('キーマップデバッグ画面マウント');
  console.log('VID:', vendorId.value, 'PID:', productId.value);
});
</script>

<style scoped>
.keymap-debug-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
