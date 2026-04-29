// ─── EXAM ENGINE ─────────────────────────────────────────────

let examData   = null;
let answers    = {};       // { questionId: answer }
let timerSecs  = 180 * 60; // 3 hours
let timerInt   = null;
let examId     = null;

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  const { data: { user } } = await _supabase.auth.getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  examId = new URLSearchParams(location.search).get('id');
  if (!examId) { window.location.href = 'index.html'; return; }

  const { data, error } = await _supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single();

  if (error || !data) {
    document.getElementById('examMain').innerHTML = '<p style="color:red;padding:40px">Exam not found.</p>';
    return;
  }

  examData = data;
  document.getElementById('examTitleH').textContent = data.title;
  document.title = data.title + ' — Говори';

  // Lấy dữ liệu dạng chuỗi từ data.sections và dùng JSON.parse để chuyển thành mảng thực tế
  examData.sections = typeof data.sections === 'string' ? JSON.parse(data.sections) : data.sections;

  renderExam(examData.sections);
  startTimer();
})();

// ─── TIMER ───────────────────────────────────────────────────
function startTimer() {
  updateTimerDisplay();
  timerInt = setInterval(() => {
    timerSecs--;
    updateTimerDisplay();
    if (timerSecs <= 0) { clearInterval(timerInt); submitExam(true); }
    if (timerSecs <= 600) document.getElementById('timer').classList.add('urgent');
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(timerSecs / 3600);
  const m = Math.floor((timerSecs % 3600) / 60);
  const s = timerSecs % 60;
  document.getElementById('timerDisplay').textContent =
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── RENDER ──────────────────────────────────────────────────
function renderExam(sections) {
  const main = document.getElementById('examMain');
  const nav  = document.getElementById('sectionNav');

  if (!sections.length) {
    main.innerHTML = '<p style="color:var(--muted);padding:40px">This exam has no questions yet.</p>';
    return;
  }

  // Build section tabs at top
  main.innerHTML = `
    <div class="section-tabs" id="sectionTabs">
      ${sections.map((s,i) => `
        <button class="section-tab ${i===0?'active':''}" onclick="showSection(${i})">${s.name}</button>
      `).join('')}
    </div>
    <div id="sectionsContainer">
      ${sections.map((s,i) => renderSection(s,i)).join('')}
    </div>`;

  // Sidebar nav
  nav.innerHTML = sections.map((s,i) => `
    <button class="section-tab" style="text-align:left" onclick="showSection(${i})">${s.name}</button>
  `).join('');

  showSection(0);
  updateProgress();
}

function showSection(idx) {
  document.querySelectorAll('.section-panel').forEach((p,i) => {
    p.style.display = i === idx ? 'block' : 'none';
  });
  document.querySelectorAll('.section-tab').forEach((t,i) => {
    t.classList.toggle('active', i === idx);
  });
}

function renderSection(section, sIdx) {
  const qs = (section.questions || []).map((q, qIdx) => renderQuestion(q, sIdx, qIdx)).join('');
  return `<div class="section-panel" data-section="${sIdx}" style="display:none">${qs}</div>`;
}

function renderQuestion(q, sIdx, qIdx) {
  const qId = q.id || `${sIdx}_${qIdx}`;
  let inner = '';

  switch (q.type) {
    case 'mcq':          inner = renderMCQ(q, qId);       break;
    case 'fill':         inner = renderFill(q, qId);      break;
    case 'listening':    inner = renderListening(q, qId); break;
    case 'ordering':     inner = renderOrdering(q, qId);  break;
    default:             inner = `<p style="color:var(--muted)">Unknown question type: ${q.type}</p>`;
  }

  return `
    <div class="question-block" id="qblock_${qId}">
      <div class="question-num">Question ${qIdx + 1} · ${typeLabel(q.type)}</div>
      <div class="question-text">${q.question || ''}</div>
      ${inner}
    </div>`;
}

function typeLabel(t) {
  return { mcq:'Multiple Choice', fill:'Fill in the Blank', listening:'Listening', ordering:'Sentence Ordering' }[t] || t;
}

// ─── MCQ ─────────────────────────────────────────────────────
function renderMCQ(q, qId) {
  return `<div class="mcq-options">
    ${q.options.map((opt, i) => `
      <div class="mcq-option" id="opt_${qId}_${i}" onclick="selectMCQ('${qId}', ${i}, this)">
        <div class="option-letter">${String.fromCharCode(65+i)}</div>
        <span>${opt}</span>
      </div>`).join('')}
  </div>`;
}

function selectMCQ(qId, idx, el) {
  document.querySelectorAll(`[id^="opt_${qId}_"]`).forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[qId] = idx;
  updateProgress();
}

// ─── FILL BLANK ──────────────────────────────────────────────
function renderFill(q, qId) {
  return `<input class="fill-input" type="text" placeholder="Type your answer in Russian…"
    oninput="answers['${qId}'] = this.value; updateProgress()"
    value="${answers[qId] || ''}" />`;
}

// ─── LISTENING ───────────────────────────────────────────────
function renderListening(q, qId) {
  let audioHtml = '';
  if (q.audioUrl) {
    audioHtml = `
      <div class="audio-player">
        <button class="audio-btn" onclick="playAudio('audio_${qId}', this)">▶</button>
        <div>
          <div style="color:#fff;font-weight:600;font-size:14px">Audio Clip</div>
          <div class="audio-label">Click to play the recording</div>
        </div>
        <audio id="audio_${qId}" src="${q.audioUrl}" style="display:none"></audio>
      </div>`;
  } else {
    audioHtml = `<div class="audio-player"><div class="audio-label" style="color:rgba(255,255,255,.5)">⚠ No audio file attached to this question.</div></div>`;
  }
  return audioHtml + renderMCQ(q, qId);
}

function playAudio(audioId, btn) {
  const audio = document.getElementById(audioId);
  if (!audio) return;
  if (audio.paused) { audio.play(); btn.textContent = '⏸'; }
  else { audio.pause(); btn.textContent = '▶'; }
  audio.onended = () => { btn.textContent = '▶'; };
}

// ─── SENTENCE ORDERING ───────────────────────────────────────
function renderOrdering(q, qId) {
  const words = shuffleArr([...(q.words || [])]);
  // store original answer array
  if (!answers[qId]) answers[qId] = [];

  return `
    <p class="ordering-label">Word Bank — drag words to build the sentence</p>
    <div class="word-bank" id="bank_${qId}" 
         ondragover="allowDrop(event)" ondrop="dropToBank(event,'${qId}')">
      ${words.map((w,i) => `
        <div class="word-chip" draggable="true"
             id="word_${qId}_${i}"
             ondragstart="dragStart(event,'${qId}',${i},'${w}')"
             ondragend="dragEnd(event)">
          ${w}
        </div>`).join('')}
    </div>
    <p class="ordering-label">Your Answer — drop words here in order</p>
    <div class="drop-zone" id="drop_${qId}"
         ondragover="allowDrop(event)" ondrop="dropToAnswer(event,'${qId}')">
    </div>`;
}

let _dragData = null;

function dragStart(e, qId, wordIdx, word) {
  _dragData = { qId, wordIdx, word, from: e.currentTarget.parentElement.id };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function dragEnd(e) { e.currentTarget.classList.remove('dragging'); }
function allowDrop(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }

function dropToAnswer(e, qId) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  if (!_dragData) return;
  const src = document.getElementById(_dragData.from === `drop_${qId}` ? `drop_${qId}` : `bank_${qId}`);
  // Move chip to drop zone
  const drop = document.getElementById(`drop_${qId}`);
  const chip = document.getElementById(`word_${_dragData.qId}_${_dragData.wordIdx}`);
  if (chip) drop.appendChild(chip);
  // Update answer
  answers[qId] = [...drop.querySelectorAll('.word-chip')].map(c => c.textContent.trim());
  updateProgress();
}

function dropToBank(e, qId) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  if (!_dragData) return;
  const bank = document.getElementById(`bank_${qId}`);
  const chip = document.getElementById(`word_${_dragData.qId}_${_dragData.wordIdx}`);
  if (chip) bank.appendChild(chip);
  const drop = document.getElementById(`drop_${qId}`);
  answers[qId] = [...drop.querySelectorAll('.word-chip')].map(c => c.textContent.trim());
  updateProgress();
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── PROGRESS ────────────────────────────────────────────────
function updateProgress() {
  const sections = examData?.sections || [];
  let total = 0, done = 0;
  sections.forEach(s => (s.questions || []).forEach(q => {
    total++;
    const qId = q.id;
    const ans = answers[qId];
    if (ans !== undefined && ans !== '' && !(Array.isArray(ans) && !ans.length)) done++;
  }));
  const pct = total ? Math.round((done/total)*100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `${done} of ${total} answered`;
}

// ─── SUBMIT ──────────────────────────────────────────────────
function confirmLeave() {
  if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
    clearInterval(timerInt);
    history.back();
  }
}

async function submitExam(auto = false) {
  if (!auto && !confirm('Submit your exam now? You cannot change answers afterward.')) return;
  clearInterval(timerInt);

  // Score the exam
  const sections = examData?.sections || [];
  let totalQ = 0, correctQ = 0;
  const breakdown = [];

  sections.forEach(section => {
    let secTotal = 0, secCorrect = 0;
    (section.questions || []).forEach(q => {
      totalQ++; secTotal++;
      const ans = answers[q.id];
      let correct = false;
      if (q.type === 'mcq' || q.type === 'listening') {
        correct = ans === q.correctIndex;
      } else if (q.type === 'fill') {
        correct = typeof ans === 'string' &&
          ans.trim().toLowerCase() === (q.answer || '').trim().toLowerCase();
      } else if (q.type === 'ordering') {
        correct = Array.isArray(ans) && ans.join(' ') === (q.correctOrder || []).join(' ');
      }
      if (correct) { correctQ++; secCorrect++; }
    });
    breakdown.push({ name: section.name, correct: secCorrect, total: secTotal });
  });

  const pct = totalQ ? Math.round((correctQ / totalQ) * 100) : 0;

  // Save to Supabase
  const { data: { user } } = await _supabase.auth.getUser();
  if (user) {
    await _supabase.from('exam_results').insert({
      user_id:    user.id,
      exam_id:    examId,
      score:      pct,
      correct:    correctQ,
      total:      totalQ,
      time_taken: 180*60 - timerSecs,
    });
  }

  showResults(pct, correctQ, totalQ, breakdown);
}

function showResults(pct, correct, total, breakdown) {
  document.getElementById('resultsOverlay').style.display = 'block';
  document.getElementById('rScore').textContent = pct + '%';
  document.getElementById('rLabel').textContent =
    pct >= 80 ? '🎉 Tuyệt vời' :
    pct >= 60 ? '👍 Có cố gắng!' :
    '📚 Keep practicing!';
  document.getElementById('rBreakdown').innerHTML = `
    <div class="results-row"><span class="label">Total Questions</span><span class="value">${total}</span></div>
    <div class="results-row"><span class="label">Correct Answers</span><span class="value">${correct}</span></div>
    ${breakdown.map(b => `
      <div class="results-row">
        <span class="label">${b.name}</span>
        <span class="value">${b.correct}/${b.total}</span>
      </div>`).join('')}`;
}
