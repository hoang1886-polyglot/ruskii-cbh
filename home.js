// ─── HOME PAGE ────────────────────────────────────────────────

const EXAM_ICONS = ['📖','🧠','✍️','🎯','🔤','📝','🎧','🗣️','📚','🔀','⭐','🏆'];

async function loadExams() {
  const grid = document.getElementById('examsGrid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:48px">Loading exams…</div>`;

  const { data: exams, error } = await _supabase
    .from('exams')
    .select('id, title, level, question_count')
    .order('created_at', { ascending: true });

  if (error || !exams || !exams.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:48px">
      No exams published yet. Admin must upload the first exam!
    </div>`;
    return;
  }

  const { data: { user } } = await _supabase.auth.getUser();

  grid.innerHTML = exams.map((exam, i) => {
    const icon   = EXAM_ICONS[i % EXAM_ICONS.length];
    const locked = !user;
    return `
      <div class="exam-card ${locked ? 'exam-locked' : ''}"
           onclick="${locked ? "openModal('loginModal')" : `startExam('${exam.id}')`}"
           title="${locked ? 'Sign in to take this exam' : exam.title}">
        ${i === 0 ? '<div class="exam-badge">NEW</div>' : ''}
        <div class="exam-icon">${icon}</div>
        <div class="exam-name">${exam.title}</div>
        <div class="exam-level">${exam.level || 'All Levels'}</div>
        ${locked ? '<div style="font-size:20px;position:relative;z-index:1;">🔒</div>' : ''}
      </div>`;
  }).join('');
}

function startExam(examId) {
  window.location.href = `exam.html?id=${examId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadExams();
});
