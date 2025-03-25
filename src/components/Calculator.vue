<template>
  <div class="calculator">
    <button @click="showHistory = true" class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <Teleport to="body">
        <History
          v-if="showHistory"
          :historyItems="historyItems"
          @select="selectFromHistory"
          @close="showHistory = false"
          @clear="clearHistory"
        />
      </Teleport>
      <div v-if="memoryItems.length > 0" class="memory-indicator">M</div>
      <p class="calc" :class="{ activeResult: isResultCalculated }">
        {{ currentExpression }}
      </p>
      <Transition name="error-slide">
        <p v-show="error" class="error">{{ error }}</p>
      </Transition>
      <p v-if="/[+\-x÷%]/.test(currentExpression)" class="result">
        {{ formattedResult }}
      </p>
    </div>
    <div class="keyboard-up">
      <button @click="backSpace()" class="brown">Backspace</button>
      <button @click="clearEntry()" class="brown">CE</button>
      <button @click="clearAll()" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button
        @click="pressed('()')"
        class="brown"
        :class="{ highlightParenthesis: isClosingParenthesisNeeded }"
      >
        (&nbsp;&nbsp;)
      </button>
      <button @click="plusItem()" class="gray ms">M+</button>
      <button @click="minusItem()" class="gray ms">M&minus;</button>
      <button @click="saveItem()" class="gray ms">M</button>
      <button @click="negate()" class="brown">
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
          ;(operator = '÷'), (currentExpression += '÷'), calculateSubtotal()
        "
        class="brown"
      >
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button
        @click="
          ;(operator = 'x'), (currentExpression += 'x'), calculateSubtotal()
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
          ;(operator = '-'), (currentExpression += '-'), calculateSubtotal()
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
          ;(operator = '+'), (currentExpression += '+'), calculateSubtotal()
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
import History from './History.vue'
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

// Variables compartment
const firstOperand = ref<string | null>(null)
const secondOperand = ref<string | null>(null)
const operator = ref<string | null>(null)
const result = ref<number | null>(null)
const error = ref<string | undefined>(undefined)
const ast = ref<ASTNode | null>(null)
const tokens = ref<Token[]>([]) // Reactive array to store all tokens
const expression = ref('')
const currentExpression = ref<string>('')
const isResultCalculated = ref(false)
const isClosingParenthesisNeeded = ref(false)
const memoryItems = ref<string[]>([])
const historyItems = ref<string[]>([])
const showHistory = ref(false)

// Buttons compartment

const pressed = (value: string) => {
  const lastChar = currentExpression.value.slice(-1)

  if (isDecimalDigit(value) || value === ',') {
    // Если вводится число или запятая
    if (lastChar === ')') {
      currentExpression.value += 'x' // Вставляем x после закрывающей скобки
    }
    currentExpression.value += value
  } else if (value === '(') {
    // Если вводится открывающая скобка
    if (isDecimalDigit(lastChar) || lastChar === ')') {
      currentExpression.value += 'x' // Вставляем x после числа или закрывающей скобки
    }
    currentExpression.value += value
  } else if (value === '()') {
    handleParenthesis()
  } else {
    currentExpression.value += value
  }
  calculateSubtotal()
}

const handleParenthesis = () => {
  const lastChar = currentExpression.value.slice(-1)
  const openCount = (currentExpression.value.match(/\(/g) || []).length
  const closeCount = (currentExpression.value.match(/\)/g) || []).length

  if (
    openCount === closeCount ||
    currentExpression.value.length === 0 ||
    /[+\-x÷(]/.test(lastChar)
  ) {
    // Если вводится открывающая скобка
    if (isDecimalDigit(lastChar) || lastChar === ')') {
      currentExpression.value += 'x' // Вставляем x после числа или закрывающей скобки
    }
    currentExpression.value += '('
    isClosingParenthesisNeeded.value = true // Подсвечиваем кнопку, когда ввели открывающую
  } else {
    currentExpression.value += ')'
    isClosingParenthesisNeeded.value = false // Убираем подсветку, когда ввели закрывающую
  }
  calculateSubtotal()
}

const calculate = () => {
  if (currentExpression.value.length > 0) {
    try {
      // Проверка на недопустимые символы
      if (/[^0-9+\-x÷().,%]/.test(currentExpression.value)) {
        throw new SyntaxError('Illegal format used')
      }

      // Проверка на оператор в начале строки
      if (/^[+\-x÷%]/.test(currentExpression.value)) {
        throw new SyntaxError('Operator at the beginning of the expression')
      }

      // Проверка на несбалансированные скобки
      const openCount = (currentExpression.value.match(/\(/g) || []).length
      const closeCount = (currentExpression.value.match(/\)/g) || []).length
      if (openCount !== closeCount) {
        throw new SyntaxError('Unbalanced parentheses')
      }

      // Проверка на недопустимое расположение скобок
      if (/\)\(/.test(currentExpression.value)) {
        throw new SyntaxError('Invalid parentheses placement')
      }

      error.value = undefined
      tokens.value = tokenizeExpression(currentExpression.value)
      ast.value = parseExpression(tokens.value)
      result.value = evaluate(ast.value)
      // Сначала вычисляем formattedResult
      const resultToHistory = formattedResult.value
      firstOperand.value = resultToHistory
      currentExpression.value = resultToHistory
      secondOperand.value = null
      operator.value = null
      result.value = null
      isResultCalculated.value = true

      // Добавляем в историю после успешного вычисления
      const historyString = tokens.value.map((token) => token.value).join('') // Преобразуем массив токенов в строку
      historyItems.value.push(`${historyString} = ${resultToHistory}`) // Добавляем в historyItems
      // Ограничиваем количество элементов в истории (например, до 10)
      if (historyItems.value.length > 10) {
        historyItems.value.shift() // Удаляем самый старый элемент
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        error.value = err.message // Используем сообщение об ошибке из SyntaxError
        result.value = null
      } else {
        error.value = 'An unexpected error occurred'
        result.value = null
      }
    }
  }
}

const clearAll = () => {
  firstOperand.value = null
  secondOperand.value = null
  operator.value = null
  result.value = null
  error.value = undefined
  ast.value = null
  tokens.value = []
  currentExpression.value = ''
  isResultCalculated.value = false
  isClosingParenthesisNeeded.value = false
  memoryItems.value = []
}

const clearEntry = () => {
  if (isClosingParenthesisNeeded.value) {
    isClosingParenthesisNeeded.value = false
  }

  if (currentExpression.value.length > 0) {
    // Получаем токены из текущего выражения
    const currentTokens = tokenizeExpression(currentExpression.value)

    if (currentTokens.length > 0) {
      // Удаляем последний токен
      currentTokens.pop()

      // Собираем новое выражение из оставшихся токенов
      currentExpression.value = currentTokens
        .map((token) => token.value)
        .join('')

      calculateSubtotal() // Пересчитываем промежуточный результат
    } else {
      currentExpression.value = ''
    }
  }
}

const backSpace = () => {
  if (currentExpression.value.length > 0) {
    // Удаляем последний символ
    currentExpression.value = currentExpression.value.slice(0, -1)
    calculateSubtotal() // Пересчитываем промежуточный результат
  }
  if (isClosingParenthesisNeeded.value) {
    isClosingParenthesisNeeded.value = false
  }
}

const percent = () => {
  currentExpression.value += '%'
  calculateSubtotal()
}

const negate = () => {
  currentExpression.value += '(-'
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
        error.value = err.message
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

// Memory button compartment

const saveItem = () => {
  // Добавляем только если есть что добавить
  if (formattedResult.value) {
    memoryItems.value.push(formattedResult.value)
  } else if (currentExpression.value) {
    memoryItems.value.push(currentExpression.value)
  }
  // Ограничиваем количество элементов в истории (например, до 10)
  if (memoryItems.value.length > 10) {
    memoryItems.value.shift() // Удаляем самый старый элемент
  }
  currentExpression.value = ''
  console.log('Memory items:', memoryItems.value)
}

const handleMemoryOperation = (operation: '+' | '-') => {
  if (memoryItems.value.length > 0) {
    const memoryValue = parseFloat(memoryItems.value[0])
    if (!isNaN(memoryValue)) {
      if (currentExpression.value.length === 0) {
        currentExpression.value = memoryItems.value[0]
      } else {
        currentExpression.value += operation + memoryItems.value[0]
      }
      calculateSubtotal()
    } else {
      error.value = 'Invalid value in memory'
    }
  } else {
    error.value = 'Memory is empty'
  }
}

const plusItem = () => {
  handleMemoryOperation('+')
}

const minusItem = () => {
  handleMemoryOperation('-')
}

const selectFromHistory = (item: string) => {
  currentExpression.value = item
  showHistory.value = false
}

const clearHistory = () => {
  historyItems.value = []
  showHistory.value = false
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
    if ('+x÷()='.indexOf(ch) >= 0) {
      return createToken('Operator', getCurrentChar())
    }
    // Проверяем, является ли '-' унарным минусом
    if (ch === '-') {
      // Проверяем, находится ли '-' в начале строки или после '('
      if (index === 0 || input.charAt(index - 1) === '(') {
        // Это унарный минус, не создаем токен оператора
        return undefined
      } else {
        // Это бинарный минус, создаем токен оператора
        return createToken('Operator', getCurrentChar())
      }
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
    let isNegative = false // Добавляем флаг для отрицательных чисел

    // Check for negative sign at the beginning of a number or after an opening parenthesis
    if (peekCurrentChar() === '-') {
      const prevChar = index > 0 ? input.charAt(index - 1) : ''
      const nextChar = input.charAt(index + 1)
      if (index === 0 || prevChar === '(') {
        isNegative = true
        getCurrentChar() // Consume the '-'
      }
    }

    ch = peekCurrentChar()
    if (!isDecimalDigit(ch) && ch !== '.' && ch !== ',') {
      // Добавили проверку на запятую
      if (!isNegative) return undefined
    }

    number = ''
    if (isNegative) {
      number += '-'
    }
    if (ch !== '.' && ch !== ',') {
      // Добавили проверку на запятую
      number += getCurrentChar()
      while (true) {
        ch = peekCurrentChar()
        if (!isDecimalDigit(ch)) {
          break
        }
        number += getCurrentChar()
      }
    }

    if (ch === '.' || ch === ',') {
      // Добавили проверку на запятую
      number += '.' // Заменяем запятую на точку
      getCurrentChar() // Пропускаем запятую или точку
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

    // Check for open parenthesis
    if (peekCurrentChar() === '(') {
      return createToken('Operator', getCurrentChar())
    }

    // Check for operator at the beginning of the string
    if (index === 0 && /[+\-x÷%]/.test(peekCurrentChar())) {
      throw new SyntaxError('Operator at the beginning of the expression')
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
      return node.value / 100
    case 'BinaryOperator':
      const left = evaluate(node.left)
      let right = evaluate(node.right)

      if (left === null || right === null) {
        return null
      }

      if (node.right.type === 'PercentNumber') {
        if (node.operator === '+' || node.operator === '-') {
          right = left * right // Процент от левого операнда (как сейчас)
        } else if (node.operator === '*' || node.operator === '/') {
          // Для умножения и деления просто используем процент как есть
        } else {
          return null
        }
      }

      let result: number
      switch (node.operator) {
        case '+':
          result = left + right
          break
        case '-':
          result = left - right
          break
        case '*':
          result = left * right
          break
        case '/':
          if (right === 0) {
            error.value = 'Division by zero'
            return null
          }
          result = left / right
          break
        default:
          return null
      }
      return Number(result.toFixed(10)) // Округляем и преобразуем в число
    default:
      return null
  }
}

const formattedResult = computed(() => {
  if (result.value === null) {
    return '' // Или '0', если нужно отображать 0 вместо пустой строки
  }
  return result.value.toLocaleString('ru-RU', { maximumFractionDigits: 10 })
})
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
  position: relative;
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
  font-size: 2rem;
  font-weight: bold;
  padding: 15px;
}
.result {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6b31e1;
  padding-right: 15px;
}
.activeResult {
  color: #348806;
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
  font-family: Inter, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  color: #ffffff;
}
.black {
  background: linear-gradient(to bottom, #6e6e6e 30%, #040404 90%);
}
.orange {
  background: linear-gradient(to bottom, #f69545 30%, #411e01 90%);
  grid-row: span 2;
}
#percentage {
  display: inline;
  width: 44px;
}
.ms {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.6rem;
  padding: 12px;
}
.highlightParenthesis {
  box-shadow: 0 0 30px white; /* Пример подсветки */
  transition: box-shadow 0.2s ease;
}
.error {
  color: crimson;
  font-size: 1.6rem;
  font-weight: bold;
  /* padding: 15px; */
  margin-top: 0;
  text-align: center;
  position: relative; /* Добавляем позиционирование */
}

/* Стили для анимации */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.5s ease;
}
.error-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.error-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.error-slide-enter-to,
.error-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.memory-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.8rem;
  font-weight: bold;
  color: #6b31e1;
  z-index: 10;
}
</style>
