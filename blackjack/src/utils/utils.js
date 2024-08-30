export function toggleHiddenElement(element) {
  if (element) {
    element.hidden = !element.hidden;
  }
}

export function toggleDisabledElement(element) {
  if (element) {
    element.disabled = !element.disabled;
  }
}

// Create a delay in milliseconds
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toggleDisabledGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");
  toggleDisabledElement(hitBtn);
  toggleDisabledElement(standBtn);
  toggleDisabledElement(splitBtn);
  toggleDisabledElement(doubleDownBtn);
}

// enable game buttons
export function enableGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");
  hitBtn.disabled = false;
  standBtn.disabled = false;
  splitBtn.disabled = false;
  doubleDownBtn.disabled = false;
}

// disable game buttons
export function disableGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");
  hitBtn.disabled = true;
  standBtn.disabled = true;
  splitBtn.disabled = true;
  doubleDownBtn.disabled = true;
}

// disable game buttons
export function hideGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");
  hitBtn.hidden = true;
  standBtn.hidden = true;
  splitBtn.hidden = true;
  doubleDownBtn.hidden = true;
}
