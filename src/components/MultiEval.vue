<template>
  <div class="calculator">
    <div class="display">
      <div class="expression">{{ expression }}</div>
      <div class="results">{{ formattedResults }}</div>
    </div>
    <div class="buttons">
      <div class="row">
        <button
          v-for="n in [7, 8, 9]"
          :key="n"
          @click="appendNumber(n.toString())"
        >
          {{ n }}
        </button>
        <button class="operator" @click="applyOperator('+')">+</button>
      </div>
      <div class="row">
        <button
          v-for="n in [4, 5, 6]"
          :key="n"
          @click="appendNumber(n.toString())"
        >
          {{ n }}
        </button>
        <button class="operator" @click="applyOperator('-')">-</button>
      </div>
      <div class="row">
        <button
          v-for="n in [1, 2, 3]"
          :key="n"
          @click="appendNumber(n.toString())"
        >
          {{ n }}
        </button>
        <button class="operator" @click="applyOperator('×')">×</button>
      </div>
      <div class="row">
        <button @click="appendNumber('0')">0</button>
        <button @click="clear()">C</button>
        <button @click="calculateResult()">=</button>
        <button class="operator" @click="applyOperator('÷')">÷</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Operator = '+' | '-' | '×' | '÷' | null

const expression = ref('')
const currentNumber = ref('')
const lastResult = ref<number | null>(null)
const pendingOperator = ref<Operator>(null)
const results = ref<number[]>([])

const formattedResults = computed(() => {
  return results.value.join(' → ')
})

const appendNumber = (num: string) => {
  if (lastResult.value !== null && pendingOperator.value === null) {
    clear()
  }
  currentNumber.value += num
  expression.value += num
}

const applyOperator = (operator: Operator) => {
  if (currentNumber.value === '' && lastResult.value !== null) {
    pendingOperator.value = operator
    expression.value = `${lastResult.value}${operator}`
    return
  }

  if (currentNumber.value === '') return

  const number = parseFloat(currentNumber.value)

  if (lastResult.value === null) {
    lastResult.value = number
    results.value = [number]
  } else if (pendingOperator.value) {
    const result = calculate(lastResult.value, pendingOperator.value, number)
    if (result === null) return
    lastResult.value = result
    results.value.push(result)
  }

  pendingOperator.value = operator
  currentNumber.value = ''
  expression.value += operator
}

const calculateResult = () => {
  if (pendingOperator.value === null || currentNumber.value === '') return

  const number = parseFloat(currentNumber.value)
  const result = calculate(lastResult.value!, pendingOperator.value, number)
  if (result === null) return

  results.value.push(result)
  lastResult.value = result
  pendingOperator.value = null
  currentNumber.value = ''
  expression.value = ''
}

const clear = () => {
  expression.value = ''
  currentNumber.value = ''
  lastResult.value = null
  pendingOperator.value = null
  results.value = []
}

const calculate = (a: number, operator: Operator, b: number): number | null => {
  switch (operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? null : a / b
    default:
      return null
  }
}
</script>

<style scoped>
.calculator {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.display {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: right;
}

.expression {
  font-size: 18px;
  color: #666;
  min-height: 25px;
}

.results {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
  min-height: 30px;
}

.buttons {
  display: grid;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  padding: 15px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  background: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e0e0e0;
}

.operator {
  background: #ff9500;
  color: white;
}

.operator:hover {
  background: #e08500;
}
</style>
