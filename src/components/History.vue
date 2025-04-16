<template>
  <div class="history-content">
    <ul>
      <li
        v-for="(item, index) in historyItems"
        :key="index"
        @click="selectItem(item)"
        v-html="formatHistoryItem(item)"
      >        
      </li>
    </ul>
    <button @click="clearHistory()">Clear History</button>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'

const props = defineProps({
  historyItems: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'select', item: string): void
  (e: 'clear'): void
}>()

const selectItem = (item: string) => {
  emit('select', item)
}
const clearHistory = () => {
  emit('clear')
}

const formatHistoryItem = (item: string) => {
  const parts = item.split(' = ')
  if (parts.length === 2) {
    return `${parts[0]} <span class="result-color">= ${parts[1]}</span>`
  } else {
    return item; // Возвращаем исходную строку, если нет знака равенства
  }  
}
</script>

<style scoped>
.history-content {
  background-color: #090909;
  padding: 18px;
  border-radius: 8px;  
  color: #d2d6b7;
  height: 97%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.history-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto; /* Добавляем скролл, если элементов много */
  }
.history-content li {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #333;
}
.history-content li:hover {
  background-color: #333;
}
.history-content button {
  width: 70%;
  margin: 0 auto;
  margin-top: 10px;
  background: linear-gradient(to bottom, #efb187 30%, #392314 90%);
  font-family: Inter, sans-serif;
  font-size: 1.2em;
  font-weight: 700;
  color: #d2d6b7;
  border-radius: 8px;
  padding: 10px;
  border: none;
  cursor: pointer;
}
:deep(.result-color) {
  color: #adff2f;
  font-weight: bold;
}
</style>