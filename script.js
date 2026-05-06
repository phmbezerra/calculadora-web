const display = document.getElementById("display");
const expressionPreview = document.getElementById("expression-preview");
const buttons = document.getElementById("buttons");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

let expression = "";
let history = [];

function updateDisplay(value = "0") {
  display.textContent = value || "0";
}

function updatePreview(text = "Pronto para calcular") {
  expressionPreview.textContent = text;
}

function formatForPreview(expr) {
  return expr
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

function sanitizeExpression(expr) {
  return expr.replace(/×/g, "*").replace(/÷/g, "/");
}

function isLastCharOperator() {
  return /[+\-*/.]$/.test(expression);
}

function appendValue(value) {
  if (display.textContent === "Erro") {
    expression = "";
    updatePreview();
  }

  if (value === ".") {
    const parts = expression.split(/[\+\-\*\/\(\)]/);
    const currentPart = parts[parts.length - 1];
    if (currentPart.includes(".")) return;
  }

  expression += value;
  updateDisplay(formatForPreview(expression));
  updatePreview(formatForPreview(expression));
}

function appendOperator(operator) {
  if (!expression && operator !== "-") return;

  if (/[+\-*/]$/.test(expression)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  updateDisplay(formatForPreview(expression));
  updatePreview(formatForPreview(expression));
}

function clearExpression() {
  expression = "";
  updateDisplay("0");
  updatePreview();
}

function backspace() {
  if (display.textContent === "Erro") {
    clearExpression();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(formatForPreview(expression) || "0");
  updatePreview(expression ? formatForPreview(expression) : "Pronto para calcular");
}

function applyPercent() {
  if (!expression || display.textContent === "Erro") return;

  try {
    const sanitized = sanitizeExpression(expression);
    const value = Function(`"use strict"; return (${sanitized})`)();
    const result = value / 100;
    addToHistory(expression, `${result}`);
    expression = String(result);
    updateDisplay(expression);
    updatePreview("Porcentagem aplicada");
  } catch {
    showError();
  }
}

function applySqrt() {
  if (!expression || display.textContent === "Erro") return;

  try {
    const sanitized = sanitizeExpression(expression);
    const value = Function(`"use strict"; return (${sanitized})`)();

    if (value < 0) {
      showError("Raiz inválida");
      return;
    }

    const result = Math.sqrt(value);
    addToHistory(`√(${expression})`, `${result}`);
    expression = String(result);
    updateDisplay(expression);
    updatePreview("Raiz quadrada aplicada");
  } catch {
    showError();
  }
}

function showError(text = "Expressão inválida") {
  expression = "";
  updateDisplay("Erro");
  updatePreview(text);
}

function calculateResult() {
  if (!expression) return;

  try {
    const sanitized = sanitizeExpression(expression);

    if (/[^0-9+\-*/().\s]/.test(sanitized)) {
      showError();
      return;
    }

    const result = Function(`"use strict"; return (${sanitized})`)();

    if (!Number.isFinite(result)) {
      showError("Operação inválida");
      return;
    }

    addToHistory(expression, `${result}`);
    updatePreview(`${formatForPreview(expression)} =`);
    expression = String(result);
    updateDisplay(expression);
  } catch {
    showError();
  }
}

function addToHistory(expr, result) {
  history.unshift({
    expression: formatForPreview(expr),
    result,
  });

  history = history.slice(0, 8);
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = `<li class="history-empty">Nenhum cálculo realizado ainda.</li>`;
    return;
  }

  historyList.innerHTML = history
    .map(
      (item, index) => `
        <li class="history-item" data-index="${index}">
          <span class="history-expression">${item.expression}</span>
          <strong class="history-result">= ${item.result}</strong>
        </li>
      `
    )
    .join("");
}

function clearHistory() {
  history = [];
  renderHistory();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, action } = button.dataset;

  if (value !== undefined) {
    if (/[0-9()]/.test(value)) {
      appendValue(value);
      return;
    }

    if (value === ".") {
      appendValue(value);
      return;
    }

    if (/[+\-*/]/.test(value)) {
      appendOperator(value);
    }
  }

  if (action === "clear") clearExpression();
  if (action === "backspace") backspace();
  if (action === "calculate") calculateResult();
  if (action === "percent") applyPercent();
  if (action === "sqrt") applySqrt();
});

historyList.addEventListener("click", (event) => {
  const item = event.target.closest(".history-item");
  if (!item) return;

  const index = Number(item.dataset.index);
  const historyItem = history[index];
  if (!historyItem) return;

  expression = historyItem.result;
  updateDisplay(historyItem.result);
  updatePreview(`Resultado recuperado do histórico`);
});

clearHistoryButton.addEventListener("click", clearHistory);

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/[0-9]/.test(key)) {
    appendValue(key);
    return;
  }

  if (key === ".") {
    appendValue(".");
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    appendOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    backspace();
    return;
  }

  if (key === "Escape") {
    clearExpression();
    return;
  }

  if (key === "%") {
    applyPercent();
    return;
  }

  if (key === "(" || key === ")") {
    appendValue(key);
  }
});

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem("calculator-theme", theme);
}

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

const savedTheme = localStorage.getItem("calculator-theme");
applyTheme(savedTheme || "dark");

renderHistory();
updateDisplay("0");
updatePreview();