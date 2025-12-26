<template>
  <div class="flex justify-center">
    <div class="inline-flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <button
        v-for="layerNum in layerCount"
        :key="layerNum - 1"
        @click="$emit('update:modelValue', layerNum - 1)"
        :class="[
          'px-6 py-2.5 font-medium text-sm transition-colors duration-200',
          modelValue === layerNum - 1
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        ]"
      >
        L{{ layerNum - 1 }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  layerCount: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
