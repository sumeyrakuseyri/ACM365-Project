// ---------------------------
// GLOBALS
// ---------------------------
const screenHome = document.getElementById("screenHome");
const screenQuiz = document.getElementById("screenQuiz");
const screenResult = document.getElementById("screenResult");

const playerName = document.getElementById("playerName");

const btnTarih = document.getElementById("btnTarih");
const btnMagazin = document.getElementById("btnMagazin");
const btnGK = document.getElementById("btnGK");

const pillCat = document.getElementById("pillCat");
const pillQ = document.getElementById("pillQ");

const who = document.getElementById("who");
const metaCat = document.getElementById("metaCat");
const qText = document.getElementById("qText");

const mediaBox = document.getElementById("mediaBox");
const qImg = document.getElementById("qImg");

const choicesBox = document.getElementById("choices");

const timeText = document.getElementById("timeText");
const barFill = document.getElementById("barFill");

const sCorrect = document.getElementById("sCorrect");
const sWrong = document.getElementById("sWrong");
const sBlank = document.getElementById("sBlank");

const btnQuit = document.getElementById("btnQuit");

const rCorrect = document.getElementById("rCorrect");
const rWrong = document.getElementById("rWrong");
const rBlank = document.getElementById("rBlank");
const resultLine = document.getElementById("resultLine");
const detailBox = document.getElementById("detailBox");
const btnRestart = document.getElementById("btnRestart");
const btnShowDebug = document.getElementById("btnShowDebug");

let data = null;

// active game state
let categoryKey = null;
let categoryLabel = null;
let questions = [];
let current = 0;
// results: "correct" | "wrong" | "blank"
let results = [];
let locked = false;

// timer
const QUESTION_SECONDS = 30;
let remaining = QUESTION_SECONDS;
let tickInterval = null;

// ---------------------------
// HELPERS
// ---------------------------
function showScreen(screen){
	screenHome.classList.add("hidden");
	screenQuiz.classList.add("hidden");
	screenResult.classList.add("hidden");
	screen.classList.remove("hidden");
}

function pickRandom(arr, n){
	const copy = [...arr];
	for(let i = copy.length - 1; i > 0; i--){
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, n);
}

function updatePill(){
	pillCat.textContent = "Kategori: " + (categoryLabel || "-");
	pillQ.textContent = (questions.length ? `Soru: ${current + 1}/${questions.length}` : "Soru: -");
}

function setStats(){
	const c = results.filter(x => x === "correct").length;
	const w = results.filter(x => x === "wrong").length;
	const b = results.filter(x => x === "blank").length;
	sCorrect.textContent = c;
	sWrong.textContent = w;
	sBlank.textContent = b;
}

function stopTimer(){
	if(tickInterval){
		clearInterval(tickInterval);
		tickInterval = null;
	}
}

function startTimer(){
	stopTimer();
	remaining = QUESTION_SECONDS;
	timeText.textContent = remaining + "s";
	barFill.style.transform = "scaleX(1)";

	tickInterval = setInterval(() => {
		remaining -= 1;
		if(remaining < 0) remaining = 0;

		timeText.textContent = remaining + "s";
		const ratio = remaining / QUESTION_SECONDS;
		barFill.style.transform = "scaleX(" + ratio.toFixed(4) + ")";

		if(remaining <= 0){
			stopTimer();
			// time over => blank if not answered
			if(!locked){
				recordBlankAndNext();
			}
		}
	}, 1000);
}

function recordBlankAndNext(){
	locked = true;
	results[current] = "blank";
	setStats();
	setTimeout(() => goNext(), 300);
}

function goNext(){
	stopTimer();
	current += 1;

	if(current >= questions.length){
		showResults();
       const correctCount = results.filter(x=>x==="correct").length;
       const player = (playerName.value.trim() )

saveScore(player, categoryLabel, correctCount, questions, results);
loadScores();

		return;
	}

	renderQuestion();
}

function safeSetImage(src){
	if(!src){
		mediaBox.classList.add("hidden");
		qImg.removeAttribute("src");
		return;
	}

	// try load; if fails -> hide
	qImg.onload = () => {
		mediaBox.classList.remove("hidden");
	};
	qImg.onerror = () => {
		mediaBox.classList.add("hidden");
		qImg.removeAttribute("src");
	};

	qImg.src = src;
}

function renderQuestion(){
	locked = false;
	updatePill();

	const q = questions[current];
	who.textContent = (playerName.value.trim() ? playerName.value.trim() : "Oyuncu");
	metaCat.textContent = "Kategori: " + categoryLabel;

	qText.textContent = q.text;
	safeSetImage(q.img || "");

	// choices
	choicesBox.innerHTML = "";
	const letters = ["A", "B", "C", "D"];

	q.choices.forEach((ch, idx) => {
		const btn = document.createElement("button");
		btn.className = "choice";
		btn.type = "button";
		btn.innerHTML = `<div class="letter">${letters[idx]}</div><div>${escapeHtml(ch)}</div>`;

		btn.addEventListener("click", () => {
			if(locked) return;
			locked = true;
			stopTimer();

			const correctIndex = q.answerIndex;
			const isCorrect = idx === correctIndex;
			results[current] = isCorrect ? "correct" : "wrong";
			setStats();

			// show feedback (highlight correct/wrong)
			const all = [...choicesBox.querySelectorAll(".choice")];
			all.forEach((el, i) => {
				el.disabled = true;
				if(i === correctIndex) el.classList.add("correct");
			});
			if(!isCorrect) btn.classList.add("wrong");

			setTimeout(() => goNext(), 650);
		});

		choicesBox.appendChild(btn);
	});

	setStats();
	startTimer();
}

function escapeHtml(str){
	return String(str)
		.replace(/&/g,"&amp;")
		.replace(/</g,"&lt;")
		.replace(/>/g,"&gt;")
		.replace(/"/g,"&quot;")
		.replace(/'/g,"&#039;");
}

function startCategory(key, label){
	if(!data){
		alert("Sorular yüklenmedi. Live Server ile açıp tekrar dene.");
		return;
	}

	const pool = data[key];

	if(!Array.isArray(pool) || pool.length < 5){
		alert("Bu kategoride en az 5 soru olmalı. questions.json kontrol et.");
		return;
	}

	categoryKey = key;
	categoryLabel = label;

	// Random 5 question
	questions = pickRandom(pool, 5);

	// results init with blanks
	results = new Array(questions.length).fill(null);

	current = 0;
	setStats();

	updatePill();
	showScreen(screenQuiz);
	renderQuestion();
}

function showResults(){
  stopTimer();
  showScreen(screenResult);

  const correctCount = results.filter(x => x === "correct").length;
  const wrongCount   = results.filter(x => x === "wrong").length;
  const blankCount   = results.filter(x => x === "blank").length;

  const player = playerName.value.trim() || "Sümeyra";

  // 🔴 KAYIT BURADA
  saveScore(player, categoryLabel, correctCount);
  loadScores();

  rCorrect.textContent = correctCount;
  rWrong.textContent   = wrongCount;
  rBlank.textContent   = blankCount;

  resultLine.textContent =
    `${player} — ${categoryLabel} kategorisinde: ${correctCount} doğru, ${wrongCount} yanlış, ${blankCount} boş.`;
}


	// detail listing
	let html = "";
	questions.forEach((q, i) => {
		const status = results[i] || "blank";
		const label = status === "correct" ? "✅ Doğru" : (status === "wrong" ? "❌ Yanlış" : "⚪ Boş");
		html += `<div style="margin-bottom:10px;">
			<div style="font-weight:900;">${i+1}) ${escapeHtml(q.text)}</div>
			<div style="color:var(--muted); margin-top:2px;">${label}</div>
		</div>`;
	});
	detailBox.innerHTML = html || "Detay yok.";

	updatePill();


// ---------------------------
// EVENTS
// ---------------------------
btnTarih.addEventListener("click", () => startCategory("tarih", "Tarih"));
btnMagazin.addEventListener("click", () => startCategory("magazin", "Magazin"));
btnGK.addEventListener("click", () => startCategory("genelkultur", "Genel Kültür"));

btnQuit.addEventListener("click", () => {
	stopTimer();
	categoryKey = null;
	categoryLabel = null;
	questions = [];
	results = [];
	current = 0;
	updatePill();
	showScreen(screenHome);
});

btnRestart.addEventListener("click", () => {
	stopTimer();
	categoryKey = null;
	categoryLabel = null;
	questions = [];
	results = [];
	current = 0;
	updatePill();
	showScreen(screenHome);
});

btnShowDebug.addEventListener("click", () => {
	console.log("DATA:", data);
	alert("Console'a yazdırdım. F12 → Console'a bak.");
});

// ---------------------------
// LOAD DATA (questions.json)
// ---------------------------
async function loadQuestions(){
	try{
		const res = await fetch("questions.json");
		if(!res.ok) throw new Error("questions.json okunamadı: " + res.status);
		const json = await res.json();

		// Basic validations (light)
		for(const key of ["tarih","magazin","genelkultur"]){
			if(!Array.isArray(json[key])) throw new Error(`JSON içinde "${key}" array değil.`);
			json[key].forEach((q, idx) => {
				if(!q.text || !Array.isArray(q.choices) || q.choices.length !== 4) {
					throw new Error(`"${key}" içinde ${idx+1}. soruda choices 4 değil veya text yok.`);
				}
				if(typeof q.answerIndex !== "number" || q.answerIndex < 0 || q.answerIndex > 3){
					throw new Error(`"${key}" içinde ${idx+1}. soruda answerIndex 0-3 değil.`);
				}
				if(typeof q.img !== "string"){
					q.img = "";
				}
			});
		}

		data = json;
		console.log("Sorular yüklendi ✅", {
			tarih: data.tarih.length,
			magazin: data.magazin.length,
			genelkultur: data.genelkultur.length
		});

	}catch(err){
		console.error(err);
		alert("Sorular yüklenemedi. Büyük ihtimalle Live Server açman gerekiyor.\n\nHata: " + err.message);
	}
}

// Start
showScreen(screenHome);
updatePill();
loadQuestions();
loadScores();


// ---------------------------
// LOCAL STORAGE SCORE
// ---------------------------
function saveScore(name, category, correct) {
  const key = "quizScores";
  const scores = JSON.parse(localStorage.getItem(key)) || [];

  scores.push({
    name,
    category,
    correct,
    date: new Date().toLocaleString()
  });

  localStorage.setItem(key, JSON.stringify(scores));
}

function loadScores() {
  const box = document.getElementById("leaderboard");
  if (!box) return;

  const scores = JSON.parse(localStorage.getItem("quizScores")) || [];

  if (scores.length === 0) {
    box.innerHTML = "Henüz skor yok.";
    return;
  }

  box.innerHTML = scores
    .slice(-10)
    .reverse()
    .map(s => `
      <div style="margin-bottom:6px;">
        <b>${s.name}</b> – ${s.category}  
        <span style="color:#555">(${s.correct} doğru)</span>
      </div>
    `)
    .join("");
}
