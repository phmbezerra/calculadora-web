const display = document.getElementById('display');
let expression = '';

function updateDisplay(value) {
  display.textContent = value || '0';
}

function calculateResult() {
  try {
    const result = Function(`return ${expression}`)();
    expression = String(result);
    updateDisplay(expression);
  } catch (error) {
    expression = '';
    updateDisplay('Erro');
  }
}

document.querySelector('.buttons').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { value, action } = button.dataset;

  if (value) {
    expression += value;
    updateDisplay(expression);
    return;
  }

  if (action === 'clear') {
    expression = '';
    updateDisplay(expression);
  }

  if (action === 'backspace') {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  if (action === 'calculate') {
    calculateResult();
  }
});
