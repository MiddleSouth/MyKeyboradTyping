<template>
  <div v-if="showDebug && data" class="mt-6">
    <h2 class="text-xl font-bold mb-4">取得した生データ</h2>
    <div class="bg-gray-900 p-4 rounded-lg overflow-x-auto">
      <pre class="text-green-400 font-mono text-sm">{{ formattedData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: any
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDebug: true
})

const formattedData = computed(() => {
  if (!props.data) return ''
  return JSON.stringify(props.data, null, 2)
})
</script>
