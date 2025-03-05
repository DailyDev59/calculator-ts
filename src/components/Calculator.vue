<!-- <template>
  <div class="calculator">
    <button class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <p class="calc">{{ expression }}{{ currentInput }}</p>
      <p
        v-if="expression.includes('%') || (expression && currentInput)"
        class="result"
      >
        {{ formattedSubtotal }}
      </p>
    </div>
    <div class="keyboard-up">
      <button class="brown">Backspace</button>
      <button class="brown">CE</button>
      <button @click="clear" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button class="gray ms">( )</button>
      <button class="gray ms">ms</button>
      <button class="gray ms">m&ndash;</button>
      <button class="gray">
        <img src="./../assets/img/m+.svg" alt="m+" />
      </button>
      <button class="brown">
        <img src="./../assets/img/plus-minus.svg" alt="plus-minus" />
      </button>
      <button @click="handleOperator('%')" class="brown">
        <img
          id="percentage"
          src="./../assets/img/icons8-percentage-100.png"
          alt="percentage"
        />
      </button>
      <button @click="handleOperator('÷')" class="brown">
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button @click="handleOperator('x')" class="brown">
        <img src="./../assets/img/multiply.svg" alt="multiply" />
      </button>
      <button @click="enterNum('7')" class="black">
        <img src="./../assets/img/seven.svg" alt="seven" />
      </button>
      <button @click="enterNum('8')" class="black">
        <img src="./../assets/img/eight.svg" alt="eight" />
      </button>
      <button @click="enterNum('9')" class="black">
        <img src="./../assets/img/nine.svg" alt="nine" />
      </button>
      <button @click="handleOperator('-')" class="brown">
        <img src="./../assets/img/minus.svg" alt="minus" />
      </button>
      <button @click="enterNum('4')" class="black">
        <img src="./../assets/img/four.svg" alt="four" />
      </button>
      <button @click="enterNum('5')" class="black">
        <img src="./../assets/img/five.svg" alt="five" />
      </button>
      <button @click="enterNum('6')" class="black">
        <img src="./../assets/img/six.svg" alt="six" />
      </button>
      <button @click="handleOperator('+')" class="brown">
        <img src="./../assets/img/plus.svg" alt="plus" />
      </button>
      <button @click="enterNum('1')" class="black">
        <img src="./../assets/img/one.svg" alt="one" />
      </button>
      <button @click="enterNum('2')" class="black">
        <img src="./../assets/img/two.svg" alt="two" />
      </button>
      <button @click="enterNum('3')" class="black">
        <img src="./../assets/img/three.svg" alt="three" />
      </button>
      <button @click="handleEqual" class="orange">
        <img src="./../assets/img/equal.svg" alt="equal" />
      </button>
      <button @click="enterNum('0')" class="black box0">
        <img src="./../assets/img/zero.svg" alt="zero" />
      </button>
      <button @click="enterNum(',')" class="black">
        <img src="./../assets/img/comma.svg" alt="comma" />
      </button>
    </div>
  </div>
</template> -->

<script setup lang="ts">
import { ref, computed } from 'vue'

const expression = ref('')
let index = ref(0)
const length = computed(() => expression.value.length)

const isWhiteSpace = (ch: string) => {
  return ch === 'u0009' || ch === ' ' || ch === 'u00A0'
}

const isLetter = (ch: string) => {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

const isDecimalDigit = (ch: string) => {
  return ch >= '0' && ch <= '9'
}

const createToken = (type: string, value: string) => {
  return {
    type: type,
    value: value,
  }
}

const getNextChar = () => {
  let ch = '\x00',
    idx = index
  if (idx < length) {
    ch = expression.value.charAt(idx.value)
    index.value += 1
  }
  return ch
}

function peekNextChar() {
  var idx = index
  return idx < length ? expression.value.charAt(idx.value) : '\x00'
}

const skipSpaces = () => {
  let ch: string

  while (index < length) {
    ch = peekNextChar()
    if (!isWhiteSpace(ch)) {
      break
    }
    getNextChar()
  }
}

const scanOperator = () => {
  let ch = peekNextChar()
  if ('+-*/()='.indexOf(ch) >= 0) {
    return createToken('Operator', getNextChar())
  }
  return undefined
}

const isIdentifierStart = (ch: string) => {
  return ch === '_' || isLetter(ch)
}

const isIdentifierPart = (ch: string) => {
  return isIdentifierStart(ch) || isDecimalDigit(ch)
}

const scanIdentifier = () => {
  let ch: string, id: string

  ch = peekNextChar()
  if (!isIdentifierStart(ch)) {
    return undefined
  }

  id = getNextChar()
  while (true) {
    ch = peekNextChar()
    if (!isIdentifierPart(ch)) {
      break
    }
    id += getNextChar()
  }

  return createToken('Identifier', id)
}

const scanNumber = () => {
  // return a token representing a number
  // or undefined if no number is recognized
  let ch: string

  ch = peekNextChar()
  if (!isDecimalDigit(ch) && ch !== '.') {
    return undefined
  }

  let number: string

  number = ''
  if (ch !== '.') {
    number = getNextChar()
    while (true) {
      ch = peekNextChar()
      if (!isDecimalDigit(ch)) {
        break
      }
      number += getNextChar()
    }
  }

  if (ch === '.') {
    number += getNextChar()
    while (true) {
      ch = peekNextChar()
      if (!isDecimalDigit(ch)) {
        break
      }
      number += getNextChar()
    }
  }

  if (ch === 'e' || ch === 'E') {
    number += getNextChar()
    ch = peekNextChar()
    if (ch === '+' || ch === '-' || isDecimalDigit(ch)) {
      number += getNextChar()
      while (true) {
        ch = peekNextChar()
        if (!isDecimalDigit(ch)) {
          break
        }
        number += getNextChar()
      }
    } else {
      throw new SyntaxError('Unexpected character after the exponent sign')
    }
  }
  return createToken('Number', number);
}

const next = () => {
    let token: {type: string, value: string}
 
    skipSpaces();
    if (index.value >= length.value) {
        return undefined;
    }
 
    token = scanNumber();
    if (typeof token !== 'undefined') {
        return token;
    }
 
    token = scanOperator();
    if (typeof token !== 'undefined') {
        return token;
    }
 
    token = scanIdentifier();
    if (typeof token !== 'undefined') {
        return token;
    }
 
    throw new SyntaxError('Unknown token from character ' + peekNextChar());
}
</script>

<!-- <style scoped>
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
  color: #6b31e1;
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
  font-size: 1.8rem;
}
</style> -->
