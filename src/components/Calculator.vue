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
      <p class="ast">AST: {{ ast }}</p>
      <p class="result">Result: {{ result }}</p>
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

//AST
type NumberNode = {
  type: 'Number'
  value: number
}

type PercentNumberNode = {
  type: 'PercentNumber'
  value: number
}

type BinaryOperatorNode = {
  type: 'BinaryOperator'
  operator: string
  left: ASTNode
  right: ASTNode
}

type ASTNode = NumberNode | PercentNumberNode | BinaryOperatorNode

const expression = ref('')
const tokens = ref<Token[]>([]) // Reactive array to store all tokens
const ast = ref<ASTNode | null>(null)
const error = ref<string | undefined>(undefined)
const result = ref<number | null>(null)

// Watch for changes in the expression and tokenize it automatically
watch(expression, (newExpression) => {
  try {
    error.value = undefined // Clear any previous errors
    tokens.value = tokenizeExpression(newExpression) // Tokenize the new expression
    ast.value = parseExpression(tokens.value)
    result.value = evaluate(ast.value)
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
    if ('+-x÷()='.indexOf(ch) >= 0) {
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

const parseExpression = (tokens: Token[]): ASTNode | null => {
  // Добавим проверку на пустую строку
  if (tokens.length === 0) {
    return null
  }

  let index = 0

  const peek = (): Token | undefined => tokens[index]
  const consume = (): Token | undefined => tokens[index++]

  const parseNumber = (): ASTNode | undefined => {
    const token = peek()
    if (token?.type === 'Number') {
      consume()
      return { type: 'Number', value: parseFloat(token.value) }
    }
    if (token?.type === 'PercentNumber') {
      consume()
      return {
        type: 'PercentNumber',
        value: parseFloat(token.value.slice(0, -1)), // Сохраняем значение без %
      }
    }
    return undefined
  }

  const parsePrimary = (): ASTNode | undefined => {
    const token = peek()
    if (token?.type === 'Operator' && token.value === '(') {
      consume() // Съедаем открывающую скобку
      const expr = parseExpressionInternal() // Рекурсивно разбираем выражение внутри скобок
      if (peek()?.type !== 'Operator' || peek()?.value !== ')') {
        return null
      }
      consume() // Съедаем закрывающую скобку
      return expr
    }
    return parseNumber()
  }

  const parseFactor = (): ASTNode | undefined => {
    return parsePrimary()
  }

  const parseTerm = (): ASTNode | undefined => {
    let left = parseFactor()
    if (!left) return undefined

    while (true) {
      const token = peek()
      if (
        token?.type === 'Operator' &&
        (token.value === 'x' || token.value === '÷')
      ) {
        consume()
        const right = parseFactor()
        if (!right) {
          // Если нет правого операнда, то выражение неполное, возвращаем null
          return null
        }
        left = {
          type: 'BinaryOperator',
          operator: token.value === 'x' ? '*' : '/', // Преобразование в стандартные * и /
          left: left,
          right: right,
        }
      } else {
        break
      }
    }
    return left
  }

  const parseExpressionInternal = (): ASTNode | undefined => {
    let left = parseTerm()
    if (!left) return undefined

    while (true) {
      const token = peek()
      if (
        token?.type === 'Operator' &&
        (token.value === '+' || token.value === '-')
      ) {
        consume()
        const right = parseTerm()
        if (!right) {
          // Если нет правого операнда, то выражение неполное, возвращаем null
          return null
        }
        left = {
          type: 'BinaryOperator',
          operator: token.value,
          left: left,
          right: right,
        }
      } else {
        break
      }
    }
    return left
  }

  const result = parseExpressionInternal()
  if (result === undefined || index !== tokens.length) {
    // Если result не определен, или не дошли до конца, то возвращаем null
    return null
  }

  return result
}

const evaluate = (node: ASTNode | null): number | null => {
  if (node === null) {
    return null
  }

  switch (node.type) {
    case 'Number':
      return node.value
    case 'PercentNumber':
      // Проверяем, является ли PercentNumberNode правым операндом в BinaryOperatorNode
      let isRightOperand = false;
      if (ast.value && ast.value.type === 'BinaryOperator') {
        isRightOperand = ast.value.right === node;
      }
      if (!isRightOperand) {
        return node.value / 100; // Делим на 100, если это не правый операнд
      }
      return node.value; // Если это правый операнд, не делим на 100
    case 'BinaryOperator':
      const left = evaluate(node.left)
      let right = evaluate(node.right) // Сначала вычисляем правый операнд

      if (left === null || right === null) {
        return null
      }

      // Проверяем, является ли правый операнд PercentNumberNode
      if (node.right.type === 'PercentNumber') {
        right = (left * right) / 100 // Вычисляем процент от левого операнда
      }

      switch (node.operator) {
        case '+':
          return left + right
        case '-':
          return left - right
        case '*':
          return left * right
        case '/':
          if (right === 0) {
            error.value = 'Division by zero'
            return null
          }
          return left / right
        default:
          return null
      }
    default:
      return null
  }
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
