<template>
  <div class="calculator">
    <div class="display">
      <div>{{ expression }}{{ currentInput }}</div>
      <div v-if="subtotal !== null">= {{ subtotal }}</div>
    </div>

    <div class="buttons">
      <div class="digits">
        <button
          v-for="digit in '7894561230'.split('')"
          :key="digit"
          @click="handleDigit(digit)"
        >
          {{ digit }}
        </button>
      </div>

      <div class="operators">
        <button
          v-for="op in '+-*/'.split('')"
          :key="op"
          @click="handleOperator(op)"
        >
          {{ op }}
        </button>
        <button @click="handleEqual">=</button>
        <button @click="clear">C</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const expression = ref('')
const currentInput = ref('')
const subtotal = ref<number | null>(null)

const handleDigit = (digit: string) => {
  currentInput.value += digit
  calculateIntermediate()
}

const handleOperator = (operator: string) => {
  if (currentInput.value) {
    expression.value += currentInput.value + operator
    currentInput.value = ''
    calculateIntermediate()
  } else if (expression.value) {
    // Replace the last operator
    expression.value = expression.value.slice(0, -1) + operator
    calculateIntermediate()
  }
}

const calculateIntermediate = () => {
  const expr = expression.value + currentInput.value
  subtotal.value = evaluateExpression(expr)
}

function evaluateExpression(expr: string): number | null {
  if (!expr) return null

  // Tokenize the expression
  const tokens = expr.match(/(\d+|\+|\-|\*|\/)/g)
  if (!tokens) return null

  const stack: number[] = []
  let currentOperator: string | null = null

  for (const token of tokens) {
    if (/\d+/.test(token)) {
      const number = parseFloat(token)
      if (currentOperator) {
        const prevNumber = stack.pop()!
        if (currentOperator === '+') stack.push(prevNumber + number)
        else if (currentOperator === '-') stack.push(prevNumber - number)
        else if (currentOperator === '*') stack.push(prevNumber * number)
        else if (currentOperator === '/') stack.push(prevNumber / number)
        currentOperator = null
      } else {
        stack.push(number)
      }
    } else if (/[\+\-\*\/]/.test(token)) {
      currentOperator = token
    }
  }

  return stack.length > 0 ? stack[0] : null
}

const handleEqual = () => {
  if (currentInput.value) {
    expression.value += currentInput.value
    currentInput.value = ''
    calculateIntermediate()
    expression.value = '' // Reset after calculation
  }
}

const clear = () => {
  expression.value = ''
  currentInput.value = ''
  subtotal.value = null
}
</script>