// ─── ADMIN PAGE ──────────────────────────────────────────────

const ADMIN_EMAILS_LOCAL = ['hoang1886@gmail.com']; // keep in sync with auth.js

let pendingExam = null;

(async () => {
  const { data: { user } } = await _supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS_LOCAL.includes(user.email)) {
    document.getElementById('accessDenied').style.display = 'block';
    return;
  }

  document.getElementById('adminPage').style.display = 'block';
  loadAdminExams();
})();

// ─── FILE UPLOAD ─────────────────────────────────────────────
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.endsWith('.json')) { showToast('Please select a .json file', 'error'); return; }

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const json = JSON.parse(ev.target.result);
      validateAndPreview(json);
    } catch {
      showToast('Invalid JSON file. Please check the format.', 'error');
    }
  };
  reader.readAsText(file);
}

// Drag-drop on upload zone
const uploadZone = document.querySelector('.upload-zone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--red)'; });
  uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvt = { target: { files: [file] } };
      handleFileUpload(fakeEvt);
    }
  });
}

function validateAndPreview(json) {
  if (!json.title) { showToast('JSON missing "title" field', 'error'); return; }
  if (!Array.isArray(json.sections)) { showToast('JSON missing "sections" array', 'error'); return; }

  const qCount = json.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  pendingExam = json;

  document.getElementById('previewCard').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="font-family:var(--font-display);font-size:22px;font-weight:700">${json.title}</div>
      <div style="color:var(--muted);font-size:14px">Level: ${json.level || 'Not specified'}</div>
      <div style="color:var(--muted);font-size:14px">Sections: ${json.sections.length}</div>
      <div style="color:var(--muted);font-size:14px">Total Questions: ${qCount}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        ${json.sections.map(s => `<span style="background:var(--cream);border:1.5px solid var(--border);border-radius:8px;padding:4px 12px;font-size:13px">${s.name}</span>`).join('')}
      </div>
    </div>`;
  document.getElementById('previewSection').style.display = 'block';
}

function cancelPreview() {
  pendingExam = null;
  document.getElementById('previewSection').style.display = 'none';
  document.getElementById('jsonFileInput').value = '';
}

async function publishExam() {
  if (!pendingExam) return;
  const qCount = pendingExam.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);

  const { error } = await _supabase.from('exams').insert({
    title:          pendingExam.title,
    level:          pendingExam.level || null,
    question_count: qCount,
    sections:       pendingExam.sections,
  });

  if (error) { showToast('Failed to publish: ' + error.message, 'error'); return; }

  showToast('Exam published successfully!', 'success');
  cancelPreview();
  loadAdminExams();
}

// ─── LIST EXAMS ──────────────────────────────────────────────
async function loadAdminExams() {
  const list = document.getElementById('adminExamList');
  list.innerHTML = '<div style="color:var(--muted);font-size:14px">Loading…</div>';

  const { data, error } = await _supabase
    .from('exams')
    .select('id, title, level, question_count, created_at')
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    list.innerHTML = '<div style="color:var(--muted);font-size:14px">No exams yet. Upload your first one above!</div>';
    return;
  }

  list.innerHTML = data.map(exam => `
    <div class="exam-list-item">
      <div>
        <div class="exam-list-item-name">${exam.title}</div>
        <div class="exam-list-item-meta">
          ${exam.level || 'No level'} · ${exam.question_count || '?'} questions ·
          Published ${new Date(exam.created_at).toLocaleDateString()}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <a href="exam.html?id=${exam.id}" target="_blank" class="btn btn-ghost" style="font-size:13px">Preview</a>
        <button class="btn btn-danger" style="font-size:13px" onclick="deleteExam('${exam.id}','${exam.title}')">Delete</button>
      </div>
    </div>`).join('');
}

async function deleteExam(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  const { error } = await _supabase.from('exams').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  showToast('Exam deleted.', 'success');
  loadAdminExams();
}
