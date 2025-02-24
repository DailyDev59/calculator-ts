<template>
  <div class="calculator">
    <div class="display">
      <div>{{ expression }}{{ currentInput }}</div>
      <div v-if="intermediateResult !== null">= {{ intermediateResult }}</div>
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      expression: '',
      currentInput: '',
      intermediateResult: null as number | null,
    }
  },
  methods: {
    handleDigit(digit: string) {
      this.currentInput += digit
      this.calculateIntermediate()
    },

    handleOperator(operator: string) {
      if (this.currentInput) {
        this.expression += this.currentInput + operator
        this.currentInput = ''
        this.calculateIntermediate()
      } else if (this.expression) {
        // Замена последнего оператора
        this.expression = this.expression.slice(0, -1) + operator
        this.calculateIntermediate()
      }
    },

    calculateIntermediate() {
      const expr = this.expression + this.currentInput
      this.intermediateResult = this.evaluateExpression(expr)
    },

    evaluateExpression(expr: string): number | null {
      if (!expr) return null

      const tokens = expr.match(/(\d+|\+|\-|\*|\/)/g) // Разбиваем выражение на токены
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
    },

    handleEqual() {
      if (this.currentInput) {
        this.expression += this.currentInput
        this.currentInput = ''
        this.calculateIntermediate()
        this.expression = '' // Сброс после вычисления
      }
    },

    clear() {
      this.expression = ''
      this.currentInput = ''
      this.intermediateResult = null
    },
  },
})
</script>
