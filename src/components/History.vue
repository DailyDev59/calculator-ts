<template>
  <div class="history-modal" @click.self="close">
    <div class="history-content">
      <h2>History</h2>
      <ul>
        <li
          v-for="(item, index) in historyItems" 
          :key="index"
          @click="selectItem(item)"
        >
          {{ item }}
        </li>
      </ul>
      <button @click="clearHistory()">Clear History</button>
      <button @click="close()">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, PropType } from 'vue'

const props = defineProps({
  historyItems: { // Переименовали memoryItems в historyItems
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'select', item: string): void
  (e: 'close'): void
  (e: 'clear'): void
}>()

const selectItem = (item: string) => {
  emit('select', item)
}

const close = () => {
  emit('close')
}

const clearHistory = () => {
  emit('clear')
}
</script>

<style scoped>
.history-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.history-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  color: black;
}
</style>
