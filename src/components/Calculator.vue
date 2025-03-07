<template>
  <div class="calculator">
    <div class="display">
      <input
        type="text"
        v-model="expression"
        placeholder="Enter an expression, jackass..."
      />
      <p class="calc">Current Expression: {{ expression }}</p>
      <p class="result">Tokens:</p>
      <ul>
        <li v-for="(token, index) in tokens" :key="index">
          {{ token.type }}: {{ token.value }}
        </li>
      </ul>
      <p v-if="error" class="error">Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Define a type for the token
type Token = {
  type: string
  value: string
}

const expression = ref('')
const tokens = ref<Token[]>([]) // Reactive array to store all tokens
const error = ref<string | undefined>(undefined)

// Watch for changes in the expression and tokenize it automatically
watch(expression, (newExpression) => {
  try {
    error.value = undefined // Clear any previous errors
    tokens.value = tokenizeExpression(newExpression) // Tokenize the new expression
  } catch (err) {
    if (err instanceof SyntaxError) {
      error.value = 'Illegal format used' // Display the error message
    } else {
      error.value = 'An unexpected error occurred'
    }
    tokens.value = [] // Clear tokens if there's an error
  }
})

const isWhiteSpace = (ch: string) => {
  return ch === '\t' || ch === ' ' || ch === '\u00A0'
}

const isLetter = (ch: string) => {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

const isDecimalDigit = (ch: string) => {
  return ch >= '0' && ch <= '9'
}

const createToken = (type: string, value: string): Token => {
  return {
    type: type,
    value: value,
  }
}

const tokenizeExpression = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0

  const getCurrentChar = () => {
    let ch = ''
    if (index < input.length) {
      ch = input.charAt(index)
      index += 1
    }
    return ch
  }

  const peekCurrentChar = () => {
    return index < input.length ? input.charAt(index) : ''
  }

  const skipSpaces = () => {
    let ch: string

    while (index < input.length) {
      ch = peekCurrentChar()
      if (!isWhiteSpace(ch)) {
        break
      }
      getCurrentChar()
    }
  }

  const scanOperator = (): Token | undefined => {
    let ch = peekCurrentChar()
    if ('+-x÷%()='.indexOf(ch) >= 0) {
      return createToken('Operator', getCurrentChar())
    }
    return undefined
  }

  const isIdentifierStart = (ch: string) => {
    return ch === '_' || isLetter(ch)
  }

  const isIdentifierPart = (ch: string) => {
    return isIdentifierStart(ch) || isDecimalDigit(ch)
  }

  const scanIdentifier = (): Token | undefined => {
    let ch: string, id: string

    ch = peekCurrentChar()
    if (!isIdentifierStart(ch)) {
      return undefined
    }

    id = getCurrentChar()
    while (true) {
      ch = peekCurrentChar()
      if (!isIdentifierPart(ch)) {
        break
      }
      id += getCurrentChar()
    }

    return createToken('Identifier', id)
  }

  const scanNumber = (): Token | undefined => {
    let ch: string
    let number: string
    let isPercent = false

    ch = peekCurrentChar()
    if (!isDecimalDigit(ch) && ch !== '.') {
      return undefined
    }

    number = ''
    if (ch !== '.') {
      number = getCurrentChar()
      while (true) {
        ch = peekCurrentChar()
        if (!isDecimalDigit(ch)) {
          break
        }
        number += getCurrentChar()
      }
    }

    if (ch === '.') {
      number += getCurrentChar()
      while (true) {
        ch = peekCurrentChar()
        if (!isDecimalDigit(ch)) {
          break
        }
        number += getCurrentChar()
      }
    }

    if (ch === 'e' || ch === 'E') {
      number += getCurrentChar()
      ch = peekCurrentChar()
      if (ch === '+' || ch === '-' || isDecimalDigit(ch)) {
        number += getCurrentChar()
        while (true) {
          ch = peekCurrentChar()
          if (!isDecimalDigit(ch)) {
            break
          }
          number += getCurrentChar()
        }
      } else {
        throw new SyntaxError('Unexpected character after the exponent sign')
      }
    }

    ch = peekCurrentChar()
    if (ch === '%') {
      isPercent = true
      number += getCurrentChar()
    }

    return createToken(isPercent ? 'PercentNumber' : 'Number', number)
  }

  const scanTokens = (): Token | undefined => {
    let token: Token | undefined

    skipSpaces()
    if (peekCurrentChar() === '') {
      return undefined
    }

    token = scanNumber()
    if (token !== undefined) {
      return token
    }

    token = scanOperator()
    if (token !== undefined) {
      return token
    }

    token = scanIdentifier()
    if (token !== undefined) {
      return token
    }

    // If no valid token is found, throw an error with the problematic character
    const problematicChar = peekCurrentChar()
    throw new SyntaxError(`Unknown token from character: ${problematicChar}`)
  }

  // Tokenize the entire input
  while (index < input.length) {
    const token = scanTokens()
    if (token) {
      tokens.push(token)
    }
  }

  return tokens
}
</script>

<style scoped>
.calculator {
  font-family: Arial, sans-serif;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.display {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
}

.calc,
.result,
.error {
  font-size: 18px;
  margin: 10px 0;
}

.error {
  color: rgb(237, 89, 131);
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
</style>
