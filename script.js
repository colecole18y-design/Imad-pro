/* ===================== IMAD PRO — مزاد النجوم — Game Logic ===================== */
(function(){
"use strict";

/* ---------- Firebase (used only for the online room mode) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyA4Ktrb_0p30tNhngkWzQ757lIPSTcIuOU",
  authDomain: "imad-pro-b1883.firebaseapp.com",
  databaseURL: "https://imad-pro-b1883-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "imad-pro-b1883",
  storageBucket: "imad-pro-b1883.firebasestorage.app",
  messagingSenderId: "67409727001",
  appId: "1:67409727001:web:c188dff61e0c4567c16488"
};
let db = null;
try {
  if (window.firebase){
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }
} catch (e) {
  console.warn("Firebase init failed — online mode will be unavailable.", e);
}

// Run once the DOM is fully parsed, no matter where the <script> tag sits in the page.
if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init(){

/* ---------- Player database ---------- */
/* tier: 1 = famous/expensive, 2 = known, 3 = lesser known/cheap */
const PLAYERS = [
  // Goalkeepers
  {name:"أليسون بيكر", pos:"GK", price:60, rating:89, tier:1, club:"ليفربول"},
  {name:"تيبو كورتوا", pos:"GK", price:55, rating:88, tier:1, club:"ريال مدريد"},
  {name:"إيدرسون", pos:"GK", price:45, rating:86, tier:2, club:"مانشستر سيتي"},
  {name:"يان أوبلاك", pos:"GK", price:28, rating:84, tier:2, club:"أتلتيكو مدريد"},
  {name:"مانويل نوير", pos:"GK", price:15, rating:82, tier:3, club:"بايرن ميونخ"},
  {name:"ميكي إينيانا", pos:"GK", price:10, rating:78, tier:3, club:"برشلونة"},

  // Defenders
  {name:"فيرجيل فان دايك", pos:"DF", price:65, rating:90, tier:1, club:"ليفربول"},
  {name:"روبين دياز", pos:"DF", price:60, rating:88, tier:1, club:"مانشستر سيتي"},
  {name:"أنطونيو روديغر", pos:"DF", price:42, rating:86, tier:2, club:"ريال مدريد"},
  {name:"تشيرويل هيرنانديز", pos:"DF", price:38, rating:85, tier:2, club:"أستون فيلا"},
  {name:"تريغيه مبابي", pos:"DF", price:35, rating:84, tier:2, club:"موناكو"},
  {name:"وليام ساليبا", pos:"DF", price:50, rating:87, tier:1, club:"أرسنال"},
  {name:"أليساندرو باستوني", pos:"DF", price:40, rating:85, tier:2, club:"إنتر ميلان"},
  {name:"جوشكو غفارديول", pos:"DF", price:55, rating:87, tier:1, club:"مانشستر سيتي"},
  {name:"بن وايت", pos:"DF", price:22, rating:81, tier:3, club:"أرسنال"},
  {name:"نيكو شلوتربيك", pos:"DF", price:20, rating:80, tier:3, club:"بوروسيا دورتموند"},
  {name:"دان بوردي", pos:"DF", price:12, rating:76, tier:3, club:"برايتون"},
  {name:"يوشكو غيندوزي", pos:"DF", price:9, rating:74, tier:3, club:"لاتسيو"},

  // Midfielders
  {name:"كيفن دي بروين", pos:"MF", price:70, rating:90, tier:1, club:"مانشستر سيتي"},
  {name:"جود بيلينغهام", pos:"MF", price:90, rating:91, tier:1, club:"ريال مدريد"},
  {name:"رودري", pos:"MF", price:75, rating:90, tier:1, club:"مانشستر سيتي"},
  {name:"بيدري", pos:"MF", price:55, rating:87, tier:2, club:"برشلونة"},
  {name:"دِكلان رايس", pos:"MF", price:50, rating:86, tier:2, club:"أرسنال"},
  {name:"فيديريكو فالفيردي", pos:"MF", price:60, rating:88, tier:2, club:"ريال مدريد"},
  {name:"مارتن أوديغارد", pos:"MF", price:48, rating:86, tier:2, club:"أرسنال"},
  {name:"إنزو فيرنانديز", pos:"MF", price:45, rating:85, tier:2, club:"تشيلسي"},
  {name:"جافي هيرنانديز", pos:"MF", price:42, rating:85, tier:2, club:"برشلونة"},
  {name:"إيليوت أندرسون", pos:"MF", price:14, rating:78, tier:3, club:"نوتنغهام فورست"},
  {name:"كارني تشوكوميلا", pos:"MF", price:9, rating:75, tier:3, club:"برايتون"},
  {name:"رومان بورخي", pos:"MF", price:11, rating:76, tier:3, club:"فولفسبورغ"},
  {name:"أليكسيس ماك أليستر", pos:"MF", price:38, rating:84, tier:2, club:"ليفربول"},

  // Forwards
  {name:"كيليان مبابي", pos:"FW", price:150, rating:94, tier:1, club:"ريال مدريد"},
  {name:"إيرلينغ هالاند", pos:"FW", price:140, rating:93, tier:1, club:"مانشستر سيتي"},
  {name:"فينيسيوس جونيور", pos:"FW", price:120, rating:92, tier:1, club:"ريال مدريد"},
  {name:"لامين يامال", pos:"FW", price:110, rating:91, tier:1, club:"برشلونة"},
  {name:"هاري كين", pos:"FW", price:75, rating:88, tier:2, club:"بايرن ميونخ"},
  {name:"رافينيا", pos:"FW", price:55, rating:86, tier:2, club:"برشلونة"},
  {name:"بوكايو ساكا", pos:"FW", price:70, rating:87, tier:2, club:"أرسنال"},
  {name:"عثمان ديمبلي", pos:"FW", price:65, rating:86, tier:2, club:"باريس سان جيرمان"},
  {name:"فيكتور أوسيمين", pos:"FW", price:68, rating:87, tier:2, club:"نابولي"},
  {name:"رسمين دورتوند", pos:"FW", price:16, rating:79, tier:3, club:"موناكو"},
  {name:"إليي وحيد", pos:"FW", price:10, rating:76, tier:3, club:"وست هام"},
  {name:"كيندري بايس", pos:"FW", price:8, rating:74, tier:3, club:"لايبزيغ"},
];

const POS_LABEL = {GK:"حارس مرمى", DF:"مدافع", MF:"وسط", FW:"مهاجم"};
const POS_ICON = {GK:"🧤", DF:"🛡️", MF:"🎯", FW:"⚡"};

/* 11 rounds -> 1 GK, 4 DF, 4 MF, 2 FW — in order: keeper first, then defense, midfield, attack */
const ROUND_POSITIONS = ["GK","DF","DF","DF","DF","MF","MF","MF","MF","FW","FW"];

/* ---------- State ---------- */
let state = null;

/* ---------- Online room state ---------- */
let onlineRole = null;     // 'host' | 'guest' | null
let roomCode = null;
let roomRef = null;
let myOnlineName = "";
let actionsListenerAttached = false;
const SESSION_KEY = "imadpro_online_session";
const LOCAL_SAVE_KEY = "imadpro_local_save";
const LEADERBOARD_KEY = "imadpro_leaderboard";
const GUESS_LB_KEY = "imadpro_guess_leaderboard";
const GUESS_NAME_KEY = "imadpro_guess_name";

let currentLbTab = "auction";

/* ===================== POINTS / LEADERBOARDS ===================== */
function sanitizeKey(name){
  return String(name).trim().replace(/[.#$\[\]\/\s]+/g, "_").slice(0, 60) || "لاعب";
}

function readLocalBoard(storageKey){
  try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
  catch (e) { return {}; }
}
function writeLocalBoard(storageKey, board){
  try { localStorage.setItem(storageKey, JSON.stringify(board)); } catch (e) {}
}

function awardPoints(name, delta){
  const cleanName = String(name || "").trim();
  if (!cleanName) return;

  const board = readLocalBoard(LEADERBOARD_KEY);
  const key = sanitizeKey(cleanName);
  const prevLocal = (board[key] && board[key].points) || 0;
  board[key] = { name: cleanName, points: prevLocal + delta };
  writeLocalBoard(LEADERBOARD_KEY, board);

  if (db){
    db.ref("leaderboard/" + key).transaction(cur => {
      const val = cur || { name: cleanName, points: 0 };
      val.name = cleanName;
      val.points = (val.points || 0) + delta;
      return val;
    });
  }
}

function awardGuessScore(name, total){
  const cleanName = String(name || "").trim();
  if (!cleanName) return;

  const board = readLocalBoard(GUESS_LB_KEY);
  const key = sanitizeKey(cleanName);
  const prevBest = (board[key] && board[key].best) || 0;
  board[key] = { name: cleanName, best: Math.max(prevBest, total) };
  writeLocalBoard(GUESS_LB_KEY, board);

  if (db){
    db.ref("guessLeaderboard/" + key).transaction(cur => {
      const val = cur || { name: cleanName, best: 0 };
      val.name = cleanName;
      val.best = Math.max(val.best || 0, total);
      return val;
    });
  }
}

function pointsLabel(delta){
  if (delta > 0) return { text: "+" + delta + " نقطة", cls: "pos" };
  if (delta < 0) return { text: delta + " نقطة", cls: "neg" };
  return { text: "0 نقطة", cls: "zero" };
}

function loadLeaderboard(type){
  currentLbTab = type = type || "auction";
  const isGuess = type === "guess";
  const path = isGuess ? "guessLeaderboard" : "leaderboard";
  const field = isGuess ? "best" : "points";
  const storageKey = isGuess ? GUESS_LB_KEY : LEADERBOARD_KEY;

  $("#leaderboard-sub").textContent = isGuess
    ? "أعلى نتيجة حققتها في تحدي تخمين الأسعار"
    : "فوز = +3 نقاط · تعادل = +1 نقطة · خسارة = -2 نقطة";
  $("#tab-lb-auction").classList.toggle("active", !isGuess);
  $("#tab-lb-guess").classList.toggle("active", isGuess);

  const listEl = $("#leaderboard-list");
  listEl.innerHTML = '<p class="hint">جاري التحميل…</p>';

  if (db){
    db.ref(path).orderByChild(field).limitToLast(20).once("value").then(snap => {
      const entries = [];
      snap.forEach(child => { entries.push(child.val()); });
      entries.reverse(); // limitToLast returns ascending order
      renderLeaderboardList(entries, field);
    }).catch(() => renderLeaderboardList(localBoardAsList(storageKey, field), field));
  } else {
    renderLeaderboardList(localBoardAsList(storageKey, field), field);
  }
}

function localBoardAsList(storageKey, field){
  const board = readLocalBoard(storageKey);
  return Object.values(board).sort((a,b) => (b[field]||0) - (a[field]||0));
}

function renderLeaderboardList(entries, field){
  field = field || "points";
  const listEl = $("#leaderboard-list");
  if (!entries || !entries.length){
    listEl.innerHTML = '<p class="hint">لسه مفيش نتايج مسجّلة — العب أول تحدي!</p>';
    return;
  }
  listEl.innerHTML = entries.map((e, i) => `
    <div class="leaderboard-row">
      <span class="leaderboard-rank">${i+1}</span>
      <span class="leaderboard-name">${escapeHtml(e.name)}</span>
      <span class="leaderboard-points">${e[field]}</span>
    </div>
  `).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/* ===================== LOCAL AUTOSAVE (ai / local modes) ===================== */
function saveLocalProgress(){
  if (!state || state.mode === "online" || state.status === "finished") return;
  try { localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(state)); } catch (e) {}
}
function clearLocalProgress(){
  try { localStorage.removeItem(LOCAL_SAVE_KEY); } catch (e) {}
}
function tryResumeLocalProgress(){
  if (state) return; // an online session already took over
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LOCAL_SAVE_KEY) || "null"); } catch (e) {}
  if (!saved || !saved.currentPlayer || saved.status === "finished") return;
  state = saved;
  normalizeStateArrays();
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;
  showScreen("screen-game");
  renderGameFromState();
  startTimer();
}

function freshPool(){
  return PLAYERS.map(p => Object.assign({}, p));
}

function newState(){
  return {
    mode: null,               // 'ai' | 'local' | 'online'
    p1Name: "فريق 1",
    p2Name: "فريق 2",
    difficulty: "medium",
    timerSetting: 20,
    budget: 500,
    pool: freshPool(),
    round: 0,
    squad1: [], squad2: [],
    budget1: 500, budget2: 500,
    currentPlayer: null,
    currentBid: 0,
    currentBidder: null,      // 1 | 2 | null
    activeTurn: 1,            // whose turn to act, 1 or 2
    timeLeft: 20,
    consolationPlayer: null,
    status: "playing",        // 'playing' | 'finished' (used for online sync)
    finalScore1: null,
    finalScore2: null,
    winnerText: "",
  };
}

let timerId = null; // local-only, never synced (each browser runs its own display timer)

/* ---------- DOM helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function showScreen(id){
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
}

/* ===================== HOME SCREEN ===================== */
let selectedMode = null;

$$("#mode-grid .option-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedMode = card.dataset.mode;
    $$("#mode-grid .option-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    $("#field-p2").hidden = selectedMode !== "local";
  });
});

$("#btn-to-setup").addEventListener("click", () => {
  const p1 = $("#input-p1").value.trim();
  const errEl = $("#home-error");
  if (!selectedMode){
    errEl.textContent = "اختر طريقة اللعب أولاً"; errEl.hidden = false; return;
  }
  if (!p1){
    errEl.textContent = "من فضلك اكتب اسمك"; errEl.hidden = false; return;
  }

  if (selectedMode === "online"){
    if (!db){
      errEl.textContent = "تعذّر الاتصال بخدمة الأونلاين — تأكد من الإنترنت"; errEl.hidden = false; return;
    }
    errEl.hidden = true;
    myOnlineName = p1;
    resetOnlineRoomUI();
    showScreen("screen-online");
    return;
  }

  let p2 = "الحاسوب 🤖";
  if (selectedMode === "local"){
    p2 = $("#input-p2").value.trim();
    if (!p2){ errEl.textContent = "اكتب اسم اللاعب الثاني"; errEl.hidden = false; return; }
  }
  errEl.hidden = true;
  state = newState();
  state.mode = selectedMode;
  state.p1Name = p1;
  state.p2Name = p2;
  showScreen("screen-setup");
});

/* ===================== ONLINE ROOM SCREEN ===================== */

function resetOnlineRoomUI(){
  $("#online-idle-card").hidden = false;
  $("#online-host-card").hidden = true;
  $("#online-guest-card").hidden = true;
  $("#online-error").hidden = true;
  $("#input-join-code").value = "";
}

function showOnlineError(msg){
  const el = $("#online-error");
  el.textContent = msg;
  el.hidden = false;
}

function generateRoomCode(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

$("#btn-create-room").addEventListener("click", () => {
  if (!db) return;
  const code = generateRoomCode();
  const ref = db.ref("rooms/" + code);
  ref.set({
    host: { name: myOnlineName },
    guest: null,
    status: "waiting",
    createdAt: Date.now(),
  }).then(() => {
    onlineRole = "host";
    roomCode = code;
    roomRef = ref;
    saveOnlineSession();
    $("#online-idle-card").hidden = true;
    $("#online-host-card").hidden = false;
    $("#room-code-display").textContent = code;
    listenForGuestJoin();
  }).catch(() => showOnlineError("تعذّر إنشاء الغرفة، حاول تاني"));
});

$("#btn-copy-code").addEventListener("click", () => {
  if (!roomCode) return;
  const finish = ok => {
    const btn = $("#btn-copy-code");
    const original = btn.textContent;
    btn.textContent = ok ? "✅ اتنسخ الرمز" : "الرمز: " + roomCode;
    setTimeout(() => { btn.textContent = original; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(roomCode).then(() => finish(true)).catch(() => finish(false));
  } else {
    finish(false);
  }
});

$("#btn-join-room").addEventListener("click", () => {
  if (!db) return;
  const code = $("#input-join-code").value.trim().toUpperCase();
  if (!code){ showOnlineError("اكتب رمز الغرفة أولاً"); return; }
  $("#online-error").hidden = true;
  const ref = db.ref("rooms/" + code);
  ref.once("value").then(snap => {
    if (!snap.exists()){ showOnlineError("مفيش غرفة بالرمز ده"); return; }
    const room = snap.val();
    if (room.guest){ showOnlineError("الغرفة دي مكتملة بالفعل"); return; }
    return ref.child("guest").set({ name: myOnlineName }).then(() => {
      onlineRole = "guest";
      roomCode = code;
      roomRef = ref;
      saveOnlineSession();
      $("#online-idle-card").hidden = true;
      $("#online-guest-card").hidden = false;
      listenAsGuest();
    });
  }).catch(() => showOnlineError("حصل خطأ، تأكد من الرمز وحاول تاني"));
});

$("#btn-online-back").addEventListener("click", () => {
  detachRoomListeners();
  clearOnlineSession();
  onlineRole = null; roomCode = null; roomRef = null;
  showScreen("screen-home");
});

function saveOnlineSession(){
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, onlineRole, myOnlineName }));
  } catch (e) { /* storage unavailable — ignore, resume just won't work */ }
}
function clearOnlineSession(){
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

/* ---------- Host side: waiting for a guest ---------- */
function listenForGuestJoin(){
  roomRef.child("guest").on("value", snap => {
    const guest = snap.val();
    if (guest && guest.name){
      roomRef.child("guest").off();
      beginHostSetup(guest.name);
    }
  });
}

function beginHostSetup(guestName){
  state = newState();
  state.mode = "online";
  state.p1Name = myOnlineName;
  state.p2Name = guestName;
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;
  showScreen("screen-setup");
}

/* ---------- Guest side: waiting for host to start ---------- */
function listenAsGuest(){
  roomRef.child("status").on("value", snap => {
    const status = snap.val();
    if (status === "playing"){
      showScreen("screen-game");
    } else if (status === "finished"){
      showScreen("screen-result");
    }
  });
  roomRef.child("state").on("value", snap => {
    if (!snap.exists()) return;
    state = snap.val();
    normalizeStateArrays();
    if (state.status === "finished"){
      renderResultFromState();
    } else if (state.currentPlayer){
      renderGameFromState();
    }
  });
  roomRef.child("host").on("value", snap => {
    const host = snap.val();
    if (host && host.name && $("#squad1-name")) $("#squad1-name").textContent = host.name;
  });
}

// Firebase can drop empty arrays / turn sparse numeric objects into plain objects —
// make sure the fields we iterate over are always real arrays.
function normalizeStateArrays(){
  if (!Array.isArray(state.squad1)) state.squad1 = state.squad1 ? Object.values(state.squad1) : [];
  if (!Array.isArray(state.squad2)) state.squad2 = state.squad2 ? Object.values(state.squad2) : [];
  if (!Array.isArray(state.pool)) state.pool = state.pool ? Object.values(state.pool) : [];
}

function detachRoomListeners(){
  if (roomRef){
    roomRef.child("guest").off();
    roomRef.child("status").off();
    roomRef.child("state").off();
    roomRef.child("host").off();
    roomRef.child("actions").off();
  }
  actionsListenerAttached = false;
}

/* ---------- Host: receive guest actions ---------- */
function listenForActions(){
  if (!roomRef || actionsListenerAttached) return;
  actionsListenerAttached = true;
  roomRef.child("actions").on("child_added", snap => {
    const action = snap.val();
    const key = snap.key;
    roomRef.child("actions/" + key).remove();
    if (!state || state.mode !== "online" || !action) return;
    if (action.type === "bid") placeBid(Number(action.amount) || 1);
    else if (action.type === "surrender") doSurrender();
  });
}

/* ---------- Guest: send an action to the host ---------- */
function sendOnlineAction(type, amount){
  if (!roomRef) return;
  roomRef.child("actions").push({ from: "guest", type, amount: amount || 0, ts: Date.now() });
}

/* ---------- Host: push the authoritative state to Firebase ---------- */
function syncOnlineState(){
  if (state.mode !== "online" || onlineRole !== "host" || !roomRef) return;
  const payload = JSON.parse(JSON.stringify(state));
  roomRef.child("state").set(payload);
}

/* ---------- Resume a session after a refresh ---------- */
function tryResumeSession(){
  if (!db) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) {}
  if (!saved || !saved.roomCode || !saved.onlineRole) return;
  const ref = db.ref("rooms/" + saved.roomCode);
  ref.once("value").then(snap => {
    if (!snap.exists()){ clearOnlineSession(); return; }
    const room = snap.val();
    onlineRole = saved.onlineRole;
    roomCode = saved.roomCode;
    roomRef = ref;
    myOnlineName = saved.myOnlineName || (onlineRole === "host" ? (room.host && room.host.name) : (room.guest && room.guest.name)) || "أنا";

    if (onlineRole === "host"){
      if (room.status === "waiting"){
        showScreen("screen-online");
        $("#online-idle-card").hidden = true;
        $("#online-host-card").hidden = false;
        $("#room-code-display").textContent = roomCode;
        listenForGuestJoin();
      } else if (room.state){
        state = room.state; normalizeStateArrays();
        listenForActions();
        if (state.status === "finished"){ renderResultFromState(); showScreen("screen-result"); }
        else { showScreen("screen-game"); renderGameFromState(); }
      }
    } else {
      showScreen("screen-online");
      $("#online-idle-card").hidden = true;
      $("#online-guest-card").hidden = false;
      listenAsGuest();
    }
  }).catch(() => clearOnlineSession());
}

/* ===================== SETUP SCREEN ===================== */
let selectedDiff = "medium";
$$("#difficulty-group .pill").forEach(pill => {
  if (pill.dataset.diff === "medium") pill.classList.add("selected");
  pill.addEventListener("click", () => {
    selectedDiff = pill.dataset.diff;
    $$("#difficulty-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
  });
});

$("#slider-timer").addEventListener("input", e => {
  const v = Number(e.target.value);
  $("#val-timer").textContent = v === 0 ? "بدون" : v + " ث";
});
$("#slider-budget").addEventListener("input", e => {
  $("#val-budget").textContent = e.target.value + " م";
});

$("#btn-setup-back").addEventListener("click", () => {
  if (state && state.mode === "online"){
    detachRoomListeners();
    clearOnlineSession();
    onlineRole = null; roomCode = null; roomRef = null;
  }
  showScreen("screen-home");
});

$("#btn-start-auction").addEventListener("click", () => {
  state.difficulty = selectedDiff;
  state.timerSetting = Number($("#slider-timer").value);
  state.budget = Number($("#slider-budget").value);
  state.budget1 = state.budget;
  state.budget2 = state.budget;
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;

  if (state.mode === "online" && onlineRole === "host"){
    listenForActions();
    roomRef.update({
      status: "playing",
      settings: { difficulty: state.difficulty, timerSetting: state.timerSetting, budget: state.budget },
    });
  }
  startAuction();
});

/* ===================== AUCTION ENGINE (runs on: local player in ai/local modes, HOST only in online mode) ===================== */

function tierWeightFor(difficulty){
  if (difficulty === "easy") return [1,1,1,1,2];
  if (difficulty === "hard") return [3,3,3,2];
  return [1,2,2,3];
}

function pickPlayer(position, difficulty){
  const weights = tierWeightFor(difficulty);
  const candidates = state.pool.filter(p => p.pos === position);
  if (candidates.length === 0) return null;
  let preferred = candidates.filter(p => weights.includes(p.tier));
  const from = preferred.length ? preferred : candidates;
  const chosen = from[Math.floor(Math.random() * from.length)];
  state.pool = state.pool.filter(p => p !== chosen);
  return chosen;
}

function pickConsolation(position){
  const candidates = state.pool.filter(p => p.pos === position);
  if (candidates.length === 0) return null;
  const cheapestFirst = candidates.sort((a,b) => a.price - b.price);
  const chosen = cheapestFirst[0];
  state.pool = state.pool.filter(p => p !== chosen);
  return chosen;
}

function startAuction(){
  state.round = 0;
  state.squad1 = []; state.squad2 = [];
  renderSquads();
  showScreen("screen-game");
  nextRound();
}

function nextRound(){
  state.round++;
  if (state.round > ROUND_POSITIONS.length){
    finishAuction();
    return;
  }
  const position = ROUND_POSITIONS[state.round - 1];
  let featured = pickPlayer(position, state.difficulty);
  if (!featured){
    nextRound();
    return;
  }
  state.currentPlayer = featured;
  state.consolationPlayer = pickConsolation(position);
  state.currentBid = 0;
  state.currentBidder = null;
  state.activeTurn = (state.round % 2 === 1) ? 1 : 2;
  state.timeLeft = state.timerSetting;

  // Safety net: this can only happen if a budget hits 0 — since bidding starts
  // at 0 and rises by whole millions, anyone with budget ≥ 1 can always bid.
  const minNeeded = 1;
  if (state.budget1 < minNeeded && state.budget2 < minNeeded){
    resolveUnaffordableRound(featured, position);
    return;
  }

  renderGameFromState();
  startTimer();
  syncOnlineState();
  saveLocalProgress();
}

function resolveUnaffordableRound(featured, position){
  renderGameFromState();
  $("#turn-line").textContent = "الميزانية غير كافية لدى الطرفين — يُحسم تلقائيًا";
  $("#bidder-line").textContent = "تسوية تلقائية";
  $("#timer-wrap").style.display = "none";
  $$("#bid-controls .btn-bid").forEach(b => b.disabled = true);
  $("#btn-surrender").disabled = true;

  const winner = state.budget1 >= state.budget2 ? 1 : 2;
  state.currentBid = 0;
  state.currentBidder = winner;
  $("#current-bid").textContent = 0;
  syncOnlineState();
  saveLocalProgress();
  setTimeout(() => awardRound(winner, opponentOf(winner)), 1100);
}

function currentBudget(who){ return who === 1 ? state.budget1 : state.budget2; }
function opponentOf(who){ return who === 1 ? 2 : 1; }
function nameOf(who){ return who === 1 ? state.p1Name : state.p2Name; }

/* Is it this browser's turn to click the buttons right now? */
function isMyTurn(){
  if (!state) return false;
  if (state.mode === "ai") return state.activeTurn === 1;
  if (state.mode === "local") return true; // pass-and-play, same device
  if (state.mode === "online") return (onlineRole === "host" && state.activeTurn === 1) || (onlineRole === "guest" && state.activeTurn === 2);
  return true;
}

function updateTurnLine(){
  const isComputerTurn = state.mode === "ai" && state.activeTurn === 2;
  $("#turn-line").textContent = isComputerTurn
    ? "🤖 " + state.p2Name + " بيفكر..."
    : "دور: " + nameOf(state.activeTurn);

  const roleHint = $("#role-hint");
  if (state.mode === "online"){
    roleHint.hidden = false;
    roleHint.textContent = isMyTurn() ? "🟢 دورك دلوقتي" : "⏳ في انتظار الطرف التاني";
  } else {
    roleHint.hidden = true;
  }
}

function updateBidControlsAvailability(){
  const mine = isMyTurn();
  $$("#bid-controls .btn-bid").forEach(b => b.disabled = !mine);
  const canSurrender = state.currentBidder !== null && mine;
  $("#btn-surrender").disabled = !canSurrender;
}

/* ---------- Timer ----------
   Every client runs its own visual countdown from state.timeLeft/timerSetting.
   Only the authoritative side (host in online mode, or the sole local browser
   in ai/local modes) acts on a timeout. */
function startTimer(){
  clearInterval(timerId);
  const wrap = $("#timer-wrap");
  if (state.timerSetting === 0){
    wrap.style.display = "none";
    maybeTriggerComputerTurn();
    return;
  }
  wrap.style.display = "flex";
  renderTimer();
  const isAuthoritative = state.mode !== "online" || onlineRole === "host";
  if (!isAuthoritative) return; // guest just displays what the host syncs, doesn't tick its own logic
  timerId = setInterval(() => {
    state.timeLeft--;
    renderTimer();
    if (state.timeLeft <= 0){
      clearInterval(timerId);
      onTimeout();
    }
  }, 1000);
  maybeTriggerComputerTurn();
}

function renderTimer(){
  const pct = Math.max(0, (state.timeLeft / state.timerSetting) * 100);
  const fill = $("#timer-fill");
  fill.style.width = pct + "%";
  fill.classList.toggle("danger", state.timeLeft <= 5);
  $("#timer-num").textContent = Math.max(0, state.timeLeft);
}

function onTimeout(){
  const isComputerTurn = state.mode === "ai" && state.activeTurn === 2;
  if (isComputerTurn) return; // computer AI handles its own timing
  if (state.currentBidder === null){
    placeBid(1);
  } else {
    doSurrender();
  }
}

/* ---------- Bidding ---------- */
$$("#bid-controls .btn-bid").forEach(btn => {
  btn.addEventListener("click", () => {
    const amt = Number(btn.dataset.amt);
    if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("bid", amt);
    else placeBid(amt);
  });
});
$("#btn-surrender").addEventListener("click", () => {
  if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("surrender", 0);
  else doSurrender();
});

function placeBid(amount){
  const who = state.activeTurn;
  const newBid = state.currentBid + amount;

  if (newBid > currentBudget(who)){
    if (state.mode !== "online" || onlineRole === "host") showWarning("الميزانية مش كفاية لهذا العرض");
    return;
  }

  state.currentBid = newBid;
  state.currentBidder = who;
  state.activeTurn = opponentOf(who);

  renderGameFromState();
  startTimer();
  syncOnlineState();
  saveLocalProgress();
}

function showWarning(msg){
  const w = $("#warn-line");
  w.textContent = msg;
  w.hidden = false;
}

function doSurrender(){
  if (state.currentBidder === null) return;
  clearInterval(timerId);
  const winner = state.currentBidder;
  const loser = opponentOf(winner);
  awardRound(winner, loser);
}

function awardRound(winner, loser){
  const player = state.currentPlayer;
  const price = state.currentBid;
  if (winner === 1){ state.budget1 -= price; state.squad1.push(player); }
  else { state.budget2 -= price; state.squad2.push(player); }

  const consolation = state.consolationPlayer;
  if (consolation){
    const withRating = Object.assign({}, consolation, {price: 0, awarded:true});
    if (loser === 1) state.squad1.push(withRating);
    else state.squad2.push(withRating);
  }

  renderSquads();
  syncOnlineState();
  saveLocalProgress();
  setTimeout(nextRound, 900);
}

/* ---------- Computer AI (only used in 'ai' mode) ---------- */
function maybeTriggerComputerTurn(){
  if (state.mode !== "ai" || state.activeTurn !== 2) return;
  const remainingSlots = ROUND_POSITIONS.length - state.round + 1;
  const reserve = Math.max(0, (remainingSlots - 1) * 4);
  const maxWillingness = Math.round(state.currentPlayer.price * (1 + Math.random() * 0.7));
  const affordable = state.budget2 - reserve;

  setTimeout(() => {
    if (!state.currentPlayer) return;
    const nextMin = state.currentBid + 1;

    if (nextMin <= maxWillingness && nextMin <= affordable && nextMin <= state.budget2){
      const options = [1,5,10].filter(a => {
        const bid = state.currentBid + a;
        return bid <= affordable && bid <= maxWillingness && bid <= state.budget2;
      });
      if (options.length){
        const amt = options[Math.floor(Math.random() * options.length)];
        placeBid(amt);
        return;
      }
    }
    if (state.currentBidder !== null){
      doSurrender();
    } else {
      const minBid = state.currentBid + 1;
      if (minBid <= state.budget2){ placeBid(1); }
      else { doSurrender(); }
    }
  }, 700 + Math.random() * 900);
}

/* ---------- Rendering (shared by the engine owner AND by an online guest mirroring synced state) ---------- */
const AVATAR_PALETTE = [
  ["#d4af37", "#8a6d1f"], ["#4fa8e0", "#1f5e8a"], ["#46c98a", "#1f6b47"],
  ["#e0503c", "#8a291f"], ["#a06ee0", "#5c3d8a"], ["#e0a83c", "#8a611f"],
  ["#3ce0c8", "#1f8a79"], ["#e05c9c", "#8a2f5c"],
];

function getInitials(name){
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : "؟";
  const second = parts[1] ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

function colorForName(name){
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [c1, c2] = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return `radial-gradient(circle at 35% 30%, ${c1}, ${c2} 75%)`;
}

function renderGameFromState(){
  if (!state.currentPlayer) return;
  const position = state.currentPlayer.pos;
  const player = state.currentPlayer;

  $("#round-num").textContent = state.round;
  $("#round-total").textContent = ROUND_POSITIONS.length;
  $("#pos-chip").textContent = POS_ICON[position] + " " + POS_LABEL[position];

  const jersey = $("#player-jersey");
  jersey.textContent = getInitials(player.name);
  jersey.style.background = colorForName(player.name);

  $("#player-name").textContent = player.name;
  $("#player-club").textContent = player.club || "";
  const badge = $("#player-pos-badge");
  badge.textContent = position;
  badge.className = "badge pos-" + position;
  $("#player-base").textContent = player.price;
  $("#player-rating").textContent = player.rating || "—";
  $("#current-bid").textContent = state.currentBid;
  $("#bidder-line").textContent = state.currentBidder ? ("أعلى عرض من: " + nameOf(state.currentBidder)) : "لا يوجد عرض بعد";
  $("#warn-line").hidden = true;

  $("#timer-wrap").style.display = state.timerSetting === 0 ? "none" : "flex";
  if (state.timerSetting !== 0) renderTimer();

  renderSquads();
  updateTurnLine();
  updateBidControlsAvailability();
}

/* ---------- Squad rendering ---------- */
function slotTemplate(list, targetCount){
  let html = "";
  for (let i = 0; i < targetCount; i++){
    const p = list[i];
    if (p){
      html += `<div class="slot filled"><span class="slot-pos">${p.pos}</span><span>${p.name}</span><span class="slot-price">${p.price}م</span></div>`;
    } else {
      html += `<div class="slot"><span class="slot-pos">—</span><span>فارغ</span><span></span></div>`;
    }
  }
  return html;
}

function renderSquads(){
  $("#squad1-budget").textContent = state.budget1;
  $("#squad2-budget").textContent = state.budget2;
  $("#squad1-slots").innerHTML = slotTemplate(state.squad1, ROUND_POSITIONS.length);
  $("#squad2-slots").innerHTML = slotTemplate(state.squad2, ROUND_POSITIONS.length);
}

/* ===================== FINISH & MATCH SIMULATION ===================== */
function finishAuction(){
  clearInterval(timerId);
  const strength1 = squadStrength(state.squad1);
  const strength2 = squadStrength(state.squad2);
  state.finalScore1 = simulateGoals(strength1);
  state.finalScore2 = simulateGoals(strength2);

  if (state.finalScore1 > state.finalScore2) state.winnerText = "🏆 " + state.p1Name + " بطل المزاد!";
  else if (state.finalScore2 > state.finalScore1) state.winnerText = "🏆 " + state.p2Name + " بطل المزاد!";
  else state.winnerText = "🤝 تعادل مثير بين الفريقين!";

  // Points: win +3, draw +1, loss -2
  if (state.finalScore1 > state.finalScore2){ state.points1 = 3; state.points2 = -2; }
  else if (state.finalScore2 > state.finalScore1){ state.points1 = -2; state.points2 = 3; }
  else { state.points1 = 1; state.points2 = 1; }

  state.status = "finished";
  renderResultFromState();
  showScreen("screen-result");
  clearLocalProgress();

  // Award points once, from whichever browser is authoritative for this match
  // (the sole local browser in ai/local modes, or the host in online mode).
  if (state.mode !== "online" || onlineRole === "host"){
    awardPoints(state.p1Name, state.points1);
    awardPoints(state.p2Name, state.points2);
  }

  if (state.mode === "online" && onlineRole === "host"){
    syncOnlineState();
    roomRef.child("status").set("finished");
  }
}

function renderResultFromState(){
  $("#res-name1").textContent = state.p1Name;
  $("#res-name2").textContent = state.p2Name;
  $("#res-score1").textContent = state.finalScore1;
  $("#res-score2").textContent = state.finalScore2;
  $("#winner-line").textContent = state.winnerText;

  const p1 = pointsLabel(state.points1 || 0);
  const p2 = pointsLabel(state.points2 || 0);
  const el1 = $("#res-points1"); el1.textContent = p1.text; el1.className = "points-delta " + p1.cls;
  const el2 = $("#res-points2"); el2.textContent = p2.text; el2.className = "points-delta " + p2.cls;

  $("#res-squad1-name").textContent = state.p1Name;
  $("#res-squad2-name").textContent = state.p2Name;
  $("#res-squad1-slots").innerHTML = slotTemplate(state.squad1, ROUND_POSITIONS.length);
  $("#res-squad2-slots").innerHTML = slotTemplate(state.squad2, ROUND_POSITIONS.length);
}

function squadStrength(squad){
  if (!squad.length) return 60;
  const sum = squad.reduce((acc, p) => acc + (p.rating || 70), 0);
  return sum / squad.length;
}

function simulateGoals(avgRating){
  const chances = 10;
  const prob = Math.min(0.62, Math.max(0.06, 0.22 + (avgRating - 78) / 90));
  let goals = 0;
  for (let i = 0; i < chances; i++){
    if (Math.random() < prob) goals++;
  }
  return goals;
}

function resetToHome(){
  clearInterval(timerId);
  detachRoomListeners();
  clearOnlineSession();
  clearLocalProgress();
  onlineRole = null; roomCode = null; roomRef = null;
  guessState = null;
  showScreen("screen-choose-game");
  $$("#mode-grid .option-card").forEach(c => c.classList.remove("selected"));
  $("#field-p2").hidden = true;
  $("#input-p1").value = "";
  $("#input-p2").value = "";
  selectedMode = null;
  state = null;
}

$("#btn-replay").addEventListener("click", resetToHome);

$("#btn-game-home").addEventListener("click", () => {
  const inGame = state && state.round > 0 && state.status !== "finished";
  if (inGame && !confirm("هتخرج من المزاد الحالي وتتفقد كل التقدم — متأكد؟")) return;
  resetToHome();
});

$("#btn-open-leaderboard").addEventListener("click", () => {
  showScreen("screen-leaderboard");
  loadLeaderboard("auction");
});
$("#btn-leaderboard-back").addEventListener("click", () => showScreen("screen-choose-game"));
$("#tab-lb-auction").addEventListener("click", () => loadLeaderboard("auction"));
$("#tab-lb-guess").addEventListener("click", () => loadLeaderboard("guess"));

/* ===================== GAME TYPE SELECTION ===================== */
$$("#game-type-grid .option-card").forEach(card => {
  card.addEventListener("click", () => {
    const game = card.dataset.game;
    if (game === "auction"){
      showScreen("screen-home");
    } else if (game === "guess"){
      let savedName = "";
      try { savedName = localStorage.getItem(GUESS_NAME_KEY) || ""; } catch (e) {}
      $("#guess-input-name").value = savedName;
      $("#guess-setup-error").hidden = true;
      $$("#guess-rounds-group .pill").forEach(p => p.classList.remove("selected"));
      const defaultPill = $('#guess-rounds-group .pill[data-rounds="10"]');
      if (defaultPill) defaultPill.classList.add("selected");
      selectedGuessRounds = 10;
      showScreen("screen-guess-setup");
    }
  });
});
$("#btn-home-back").addEventListener("click", () => showScreen("screen-choose-game"));

/* ===================== GUESS-THE-PRICE GAME ===================== */
let guessState = null;
let selectedGuessRounds = 10;

$$("#guess-rounds-group .pill").forEach(pill => {
  pill.addEventListener("click", () => {
    selectedGuessRounds = Number(pill.dataset.rounds);
    $$("#guess-rounds-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
  });
});

$("#btn-guess-setup-back").addEventListener("click", () => showScreen("screen-choose-game"));

$("#btn-guess-start").addEventListener("click", () => {
  const name = $("#guess-input-name").value.trim();
  const errEl = $("#guess-setup-error");
  if (!name){ errEl.textContent = "من فضلك اكتب اسمك"; errEl.hidden = false; return; }
  errEl.hidden = true;
  try { localStorage.setItem(GUESS_NAME_KEY, name); } catch (e) {}

  const shuffled = PLAYERS.slice().sort(() => Math.random() - 0.5);
  guessState = {
    name,
    rounds: selectedGuessRounds,
    players: shuffled.slice(0, selectedGuessRounds),
    index: 0,
    totalScore: 0,
  };
  showScreen("screen-guess-game");
  renderGuessRound();
});

function renderGuessRound(){
  const player = guessState.players[guessState.index];
  $("#guess-round-num").textContent = guessState.index + 1;
  $("#guess-round-total").textContent = guessState.rounds;
  $("#guess-score-chip").textContent = guessState.totalScore + " نقطة";

  const jersey = $("#guess-player-jersey");
  jersey.textContent = getInitials(player.name);
  jersey.style.background = colorForName(player.name);

  $("#guess-player-name").textContent = player.name;
  $("#guess-player-club").textContent = player.club || "";
  const badge = $("#guess-player-pos-badge");
  badge.textContent = player.pos;
  badge.className = "badge pos-" + player.pos;
  $("#guess-player-rating").textContent = player.rating || "—";

  $("#guess-value-input").value = 20;
  $("#guess-input-wrap").hidden = false;
  $("#guess-reveal").hidden = true;
}

$$(".guess-stepper .btn-bid").forEach(btn => {
  btn.addEventListener("click", () => {
    const step = Number(btn.dataset.step);
    const input = $("#guess-value-input");
    const next = Math.max(0, (Number(input.value) || 0) + step);
    input.value = next;
  });
});

$("#btn-guess-submit").addEventListener("click", () => {
  const player = guessState.players[guessState.index];
  const guess = Math.max(0, Number($("#guess-value-input").value) || 0);
  const actual = player.price;
  const errPct = actual > 0 ? Math.abs(guess - actual) / actual * 100 : (guess === 0 ? 0 : 100);
  const roundScore = Math.round(Math.max(0, 100 - errPct * 2));
  guessState.totalScore += roundScore;

  $("#guess-actual-price").textContent = actual;
  $("#guess-score-line").textContent = "حصلت على " + roundScore + " نقطة (تخمينك: " + guess + " مليون)";
  $("#guess-input-wrap").hidden = true;
  $("#guess-reveal").hidden = false;
  $("#guess-score-chip").textContent = guessState.totalScore + " نقطة";
});

$("#btn-guess-next").addEventListener("click", () => {
  guessState.index++;
  if (guessState.index >= guessState.rounds){
    finishGuessGame();
  } else {
    renderGuessRound();
  }
});

function finishGuessGame(){
  awardGuessScore(guessState.name, guessState.totalScore);
  const maxPossible = guessState.rounds * 100;
  const pct = Math.round((guessState.totalScore / maxPossible) * 100);

  $("#guess-res-name").textContent = guessState.name;
  $("#guess-res-total").textContent = guessState.totalScore;
  let verdict;
  if (pct >= 85) verdict = "🏆 خبير انتقالات حقيقي!";
  else if (pct >= 60) verdict = "👏 متابع كويس للسوق!";
  else if (pct >= 35) verdict = "🙂 مش وحش، بس محتاج تتابع أكتر";
  else verdict = "😅 السوق محتاج منك متابعة أكتر!";
  $("#guess-res-line").textContent = verdict + " (" + pct + "% من أقصى نتيجة)";

  showScreen("screen-guess-result");
}

$("#btn-guess-replay").addEventListener("click", () => {
  guessState = null;
  showScreen("screen-choose-game");
});

$("#btn-guess-home").addEventListener("click", () => {
  const inGame = guessState && guessState.index < guessState.rounds;
  if (inGame && !confirm("هتخرج من التحدي الحالي وتفقد تقدمك — متأكد؟")) return;
  guessState = null;
  showScreen("screen-choose-game");
});

tryResumeSession();
let hasOnlineSession = false;
try { hasOnlineSession = !!localStorage.getItem(SESSION_KEY); } catch (e) {}
if (!hasOnlineSession){
  tryResumeLocalProgress();
}

} // end init()

})();
