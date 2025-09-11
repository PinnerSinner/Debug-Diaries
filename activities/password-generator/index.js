const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "~`!@#$%^&*()_-+={[}]|:;\"'<,>.?/";

function generatePassword(length, useNumbers, useSymbols) {
  let chars = letters;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

const passOne = document.getElementById("password-one");
const passTwo = document.getElementById("password-two");
const generateBtn = document.getElementById("generate");

function handleGenerate() {
  const length = parseInt(document.getElementById("length").value, 10) || 15;
  const useNumbers = document.getElementById("numbers").checked;
  const useSymbols = document.getElementById("symbols").checked;
  passOne.textContent = generatePassword(length, useNumbers, useSymbols);
  passTwo.textContent = generatePassword(length, useNumbers, useSymbols);
}

generateBtn.addEventListener("click", handleGenerate);

function copyToClipboard(el) {
  const text = el.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  el.classList.add("copied");
  setTimeout(() => el.classList.remove("copied"), 1000);
}

[passOne, passTwo].forEach(el => {
  el.addEventListener("click", () => copyToClipboard(el));
});

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  if (document.body.getAttribute("data-theme") === "light") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.setAttribute("data-theme", "light");
  }
});
