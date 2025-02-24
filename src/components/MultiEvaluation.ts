interface CalculatorData {
    currentValue: number | null;
    pendingOperator: string | null;
    currentNumber: string;
  }
  
  export default {
    data(): CalculatorData {
      return {
        currentValue: null,
        pendingOperator: null,
        currentNumber: '',
      };
    },
  
    methods: {
      handleNumber(num: string) {
        this.currentNumber += num;
      },
  
      handleOperator(op: string) {
        if (this.currentNumber === '' && this.currentValue !== null) {
          // Allow changing the operator
          this.pendingOperator = op;
          return;
        }
  
        const num = parseFloat(this.currentNumber);
        
        if (this.currentValue === null) {
          // First number input
          this.currentValue = num;
        } else if (this.pendingOperator) {
          // Perform calculation with previous operator
          this.currentValue = this.applyOperator(
            this.currentValue, 
            num, 
            this.pendingOperator
          );
        }
  
        // Update display and prepare for next number
        this.pendingOperator = op;
        this.currentNumber = '';
      },
  
      evaluate() {
        if (this.pendingOperator && this.currentNumber !== '') {
          const num = parseFloat(this.currentNumber);
          this.currentValue = this.applyOperator(
              this.currentValue!, 
              num, 
              this.pendingOperator
          );
          this.pendingOperator = null;
          this.currentNumber = this.currentValue.toString();
        }
      },
  
      applyOperator(a: number, b: number, op: string): number {
        switch (op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
          default: throw new Error('Invalid operator');
        }
      },
  
      clear() {
        this.currentValue = null;
        this.pendingOperator = null;
        this.currentNumber = '';
      }
    },
  
    computed: {
      displayValue(): string {
        return this.currentNumber || 
               this.currentValue?.toString() || 
               '0';
      }
    }
  }