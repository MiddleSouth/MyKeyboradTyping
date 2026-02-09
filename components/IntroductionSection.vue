<script setup lang="ts">
defineProps<{
  isConnected: boolean
  isDetecting?: boolean
  isLoading?: boolean
  onSelectKeyboard?: () => void
}>()
</script>

<template>
  <div v-if="!isConnected" class="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
    <!-- メインメッセージ -->
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        MyKeyboardTyping
      </h1>
      <p class="text-xl text-gray-700 mb-4">
        あなたのキーボード配列そのままで、タイピング練習ができます
      </p>
      <!-- キーボード選択ボタン -->
      <button
        v-if="onSelectKeyboard"
        @click="onSelectKeyboard"
        :disabled="isDetecting || isLoading"
        class="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold text-lg transition shadow-lg min-w-[320px]"
      >
        {{ isDetecting || isLoading ? '処理中...' : '🎹 キーボードを選択' }}
      </button>
    </div>

    <!-- 特徴 -->
    <div class="mb-6">
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="font-semibold text-gray-800 mb-2 text-lg">画面を見ながらキー位置を探せる</h2>
        <p class="text-sm text-gray-600 leading-relaxed">
          カスタマイズされたキーマップも自動で読み込み、あなたのキーボード配列をそのまま画面に表示します。<br>
          分割キーボードやカラムスタッガード配列など、特殊な配置でも正確に再現されるので、画面を見ながら迷わずタイピング練習できます。
        </p>
      </div>
    </div>

    <!-- 簡単な操作説明 -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="font-semibold text-gray-800 mb-2 text-lg">使い方</h2>
      <ol class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs mr-2 flex-shrink-0">1</span>
          <span>「キーボードを選択」ボタンをクリックして、お使いのキーボードを選択</span>
        </li>
        <li class="flex items-start">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs mr-2 flex-shrink-0">2</span>
          <span>練習素材を選択（日本語単語、英単語など）</span>
        </li>
        <li class="flex items-start">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs mr-2 flex-shrink-0">3</span>
          <span>練習開始！</span>
        </li>
      </ol>
    </div>
  </div>
</template>
