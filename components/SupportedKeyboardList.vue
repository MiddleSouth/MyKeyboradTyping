<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  isConnected: boolean
}>()

interface KeyboardInfo {
  name: string
  fileName: string
}

const keyboards = ref<KeyboardInfo[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // public/keyboards/ 配下のjsonファイル一覧を取得
    const keyboardFiles = [
      'corne.json',
      'cornelius_v2.json',
      'ergo68.json',
      'ergoarrows.json',
      'helixrev35rows.json',
      'keyball39.json',
      'keyball44.json',
      'lily58.json'
    ]

    const keyboardData = await Promise.all(
      keyboardFiles.map(async (fileName) => {
        try {
          const response = await fetch(`/keyboards/${fileName}`)
          if (!response.ok) throw new Error(`Failed to load ${fileName}`)
          const data = await response.json()
          return {
            name: data.name,
            fileName
          }
        } catch (err) {
          console.warn(`Failed to load keyboard: ${fileName}`, err)
          return null
        }
      })
    )

    keyboards.value = keyboardData.filter((kb): kb is KeyboardInfo => kb !== null)
    isLoading.value = false
  } catch (err) {
    console.error('Failed to load keyboards:', err)
    error.value = 'キーボード一覧の読み込みに失敗しました'
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="!isConnected" class="mb-6 bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">
      対応キーボード一覧
    </h2>
    
    <div v-if="isLoading" class="text-gray-500 text-sm">
      読み込み中...
    </div>
    
    <div v-else-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
    
    <ul v-else class="space-y-2">
      <li 
        v-for="keyboard in keyboards" 
        :key="keyboard.fileName"
        class="flex items-center text-gray-700"
      >
        <span class="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
        <span>{{ keyboard.name }}</span>
      </li>
    </ul>

    <p class="mt-4 text-sm text-gray-600">
      一覧にないキーボードでも練習できますが、キー配列は表示されません。
    </p>
  </div>
</template>
