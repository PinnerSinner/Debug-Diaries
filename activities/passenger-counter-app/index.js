const countEl = document.getElementById("count-el");
const entriesEl = document.getElementById("entries");
const totalEl = document.getElementById("total-el");
const btnInc = document.getElementById("increment-btn");
const btnSave = document.getElementById("save-btn");
const btnReset = document.getElementById("reset-btn");
const btnClear = document.getElementById("clear-btn");


let count = Number(localStorage.getItem("pc_count")) || 0;
let history = JSON.parse(localStorage.getItem("pc_entries") || "[]");


function renderCount(){
countEl.textContent = count;
localStorage.setItem("pc_count", String(count));
}


function renderEntries(){
if(history.length === 0){
entriesEl.innerHTML = '<span class="placeholder">No entries yet.</span>';
} else {
entriesEl.innerHTML = history.map((n,i) => `<span class="chip" title="Entry ${i+1}">${n}</span>`).join("");
}
const total = history.reduce((a,b) => a + b, 0);
totalEl.textContent = `Total saved: ${total}`;
localStorage.setItem("pc_entries", JSON.stringify(history));
}


function pulse(el){ el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }
function bump(el){ el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
function ping(el){ el.classList.remove("ping"); void el.offsetWidth; el.classList.add("ping"); }


function increment(){
count += 1;
renderCount();
pulse(countEl);
}


function save(){
if(count <= 0){ bump(btnInc); return; }
history.push(count);
renderEntries();
count = 0;
renderCount();
ping(btnSave);
}


function resetCount(){
count = 0;
renderCount();
}


function clearHistory(){
history = [];
renderEntries();
}


btnInc.addEventListener("click", increment);
btnSave.addEventListener("click", save);
btnReset.addEventListener("click", resetCount);
btnClear.addEventListener("click", clearHistory);


// Keyboard: Space = increment, S = save, R = reset
document.addEventListener("keydown", (e) => {
const tag = e.target && e.target.tagName;
if(["INPUT","TEXTAREA","SELECT","BUTTON"].includes(tag)) return;
if(e.key === " "){ e.preventDefault(); increment(); }
else if(e.key.toLowerCase() === "s"){ save(); }
else if(e.key.toLowerCase() === "r"){ resetCount(); }
});


renderCount();
renderEntries();