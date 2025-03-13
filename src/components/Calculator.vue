<!-- <template>
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
</template> -->

<template>
  <div class="calculator">
    <button class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <p class="calc">
        {{ currentExpression  || '0' }}
      </p>
      <p class="result">{{ result }}</p>
    </div>
    <div class="keyboard-up">
      <button class="brown">Backspace</button>
      <button class="brown">CE</button>
      <button @click="clear()" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button class="gray">
        <img src="./../assets/img/mc.svg" alt="mc" />
      </button>
      <button class="gray">
        <img src="./../assets/img/m+.svg" alt="m+" />
      </button>
      <button class="gray ms">ms</button>
      <button class="gray">
        <img src="./../assets/img/mr.svg" alt="mr" />
      </button>
      <button class="brown">
        <img src="./../assets/img/plus-minus.svg" alt="plus-minus" />
      </button>
      <button @click="percent()" class="brown">
        <img
          id="percentage"
          src="./../assets/img/icons8-percentage-100.png"
          alt="percentage"
        />
      </button>
      <button
        @click="
          operator = '÷',
          currentExpression += '÷',
          calculateSubtotal()
        "
        class="brown"
      >
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button
        @click="
          operator = 'x',
          currentExpression += 'x',
          calculateSubtotal()
        "
        class="brown"
      >
        <img src="./../assets/img/multiply.svg" alt="multiply" />
      </button>
      <button @click="pressed('7')" class="black">
        <img src="./../assets/img/seven.svg" alt="seven" />
      </button>
      <button @click="pressed('8')" class="black">
        <img src="./../assets/img/eight.svg" alt="eight" />
      </button>
      <button @click="pressed('9')" class="black">
        <img src="./../assets/img/nine.svg" alt="nine" />
      </button>
      <button
        @click="
          operator = '-',
          currentExpression += '-',
          calculateSubtotal()
        "
        class="brown"
      >
        <img src="./../assets/img/minus.svg" alt="minus" />
      </button>
      <button @click="pressed('4')" class="black">
        <img src="./../assets/img/four.svg" alt="four" />
      </button>
      <button @click="pressed('5')" class="black">
        <img src="./../assets/img/five.svg" alt="five" />
      </button>
      <button @click="pressed('6')" class="black">
        <img src="./../assets/img/six.svg" alt="six" />
      </button>
      <button
        @click="
          operator = '+',
          currentExpression += '+',
          calculateSubtotal()
        "
        class="brown"
      >
        <img src="./../assets/img/plus.svg" alt="plus" />
      </button>
      <button @click="pressed('1')" class="black">
        <img src="./../assets/img/one.svg" alt="one" />
      </button>
      <button @click="pressed('2')" class="black">
        <img src="./../assets/img/two.svg" alt="two" />
      </button>
      <button @click="pressed('3')" class="black">
        <img src="./../assets/img/three.svg" alt="three" />
      </button>
      <button @click="calculate()" class="orange">
        <img src="./../assets/img/equal.svg" alt="equal" />
      </button>
      <button @click="pressed('0')" class="black box0">
        <img src="./../assets/img/zero.svg" alt="zero" />
      </button>
      <button @click="pressed(',')" class="black">
        <img src="./../assets/img/comma.svg" alt="comma" />
      </button>
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

const firstOperand = ref<string | null>(null)
const secondOperand = ref<string | null>(null)
const operator = ref<string | null>(null)
const result = ref<number | null>(null)
const error = ref<string | undefined>(undefined)
const ast = ref<ASTNode | null>(null)
const tokens = ref<Token[]>([]) // Reactive array to store all tokens
const expression = ref('')
const currentExpression = ref<string>('')

// Buttons compartment

const pressed = (value: string) => {
  currentExpression.value += value
  calculateSubtotal()
}

const calculate = () => {
  if (currentExpression.value.length > 0) {
    try {
      error.value = undefined
      tokens.value = tokenizeExpression(currentExpression.value)
      ast.value = parseExpression(tokens.value)
      result.value = evaluate(ast.value)
      firstOperand.value = result.value.toString()
      currentExpression.value = firstOperand.value
      secondOperand.value = null
      operator.value = null
      result.value = null
    } catch (err) {
      if (err instanceof SyntaxError) {
        error.value = 'Illegal format used'
        result.value = null
      } else {
        error.value = 'An unexpected error occurred'
        result.value = null
      }
    }
  }
}

const clear = () => {
  firstOperand.value = null
  secondOperand.value = null
  operator.value = null
  result.value = null
  error.value = undefined
  ast.value = null
  tokens.value = []
  currentExpression.value = '';
}


const percent = () => {
  currentExpression.value += '%'
  calculateSubtotal()
}

const calculateSubtotal = () => {
  if (currentExpression.value.length > 0) {
    try {
      error.value = undefined
      tokens.value = tokenizeExpression(currentExpression.value)
      ast.value = parseExpression(tokens.value)
      result.value = evaluate(ast.value)
    } catch (err) {
      if (err instanceof SyntaxError) {
        error.value = 'Illegal format used'
        result.value = null
      } else {
        error.value = 'An unexpected error occurred'
        result.value = null
      }
    }
  } else {
    result.value = null
  }
}

// Tokenizer and evaluator compartment

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
      return node.value / 100 // Делим на 100, когда встречаем процент
    case 'BinaryOperator':
      const left = evaluate(node.left)
      let right = evaluate(node.right)

      if (left === null || right === null) {
        return null
      }

      // Проверяем, является ли правый операнд PercentNumberNode
      if (node.right.type === 'PercentNumber') {
        right = left * right // Вычисляем процент от левого операнда
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
  max-width: 470px;
  width: 100%;
  height: 875px;
  background-color: #090909;
  color: white;
  margin: 0 auto;
  border-radius: 70px;
  padding-top: 1.5em;
}
.history {
  border: 0;
  background-color: #090909;
  cursor: pointer;
  margin: 0 0 20px 50px;
}
.display {
  margin: 0 auto;
  max-width: 429px;
  width: 100%;
  max-height: 118px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #e8ead8 0%,
    #d2d6b7 38%,
    #dbdec1 61%,
    #edefe0 100%
  );
  color: black;
  line-height: 1;
  text-align: right;
}
.calc {
  margin: 0;
  font-size: 3rem;
  font-weight: bold;
  padding: 15px;
}
.result {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  padding-right: 15px;
}
.keyboard-up {
  display: grid;
  padding: 18px;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 15px;
}
.keyboard-up button {
  min-height: 57px;
  font-family: Inter, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
}
.keyboard {
  margin: 0 auto;
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 1fr));
  column-gap: 14px;
  max-width: 429px;
  row-gap: 26px;
}
.keyboard button {
  border-radius: 8px;
  cursor: pointer;
}
img {
  display: block;
  margin-left: -4px;
  margin-top: -1px;
}
.box0 {
  grid-column: span 2;
}
.gray {
  background: linear-gradient(to bottom, #8e9294 30%, #2e373b 90%);
}
.brown {
  background: linear-gradient(to bottom, #efb187 30%, #392314 90%);
}
.black {
  background: linear-gradient(to bottom, #6e6e6e 30%, #040404 90%);
}
.orange {
  background: linear-gradient(to bottom, #f69545 30%, #411e01 90%);
  grid-row: span 2;
  /* height: 136px; */
}
#parenthesis {
  font-family: Inter, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  color: #ffffff;
}
#percentage {
  display: inline;
  width: 44px;
}
.ms {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.6rem;
}
</style>

<!-- <style scoped>
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
</style> -->
