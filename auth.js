// ─── AUTH ─────────────────────────────────────────────────────

const ADMIN_EMAILS = ['hoang1886@gmail.com']; // ← put your admin email here

async function register() {
  const name  = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pass  = document.getElementById('regPassword')?.value;
  const err   = document.getElementById('registerError');
  if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
  err.textContent = '';
  const { data, error } = await _supabase.auth.signUp({
    email, password: pass,
    options: { data: { full_name: name } }
  });
  if (error) { err.textContent = error.message; return; }
  showToast('Account created! Check your email to confirm.', 'success');
  closeModal('registerModal');
}

async function login() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass  = document.getElementById('loginPassword')?.value;
  const err   = document.getElementById('loginError');
  if (!email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  err.textContent = '';
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });
  if (error) { err.textContent = error.message; return; }
  closeModal('loginModal');
  updateAuthUI(data.user);
  showToast('Welcome back!', 'success');
}

async function logout() {
  await _supabase.auth.signOut();
  updateAuthUI(null);
  showToast('Signed out.', 'success');
  if (window.location.pathname.includes('admin')) {
    window.location.href = 'index.html';
  }
}

function updateAuthUI(user) {
  const loggedOut = document.getElementById('authLoggedOut');
  const loggedIn  = document.getElementById('authLoggedIn');
  const greeting  = document.getElementById('userGreeting');
  const adminLink = document.getElementById('adminLink');
  if (user) {
    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn)  loggedIn.style.display  = 'flex';
    if (greeting)  greeting.textContent = user.user_metadata?.full_name?.split(' ')[0] || user.email;
    if (adminLink) adminLink.style.display = ADMIN_EMAILS.includes(user.email) ? 'inline' : 'none';
  } else {
    if (loggedOut) loggedOut.style.display = 'flex';
    if (loggedIn)  loggedIn.style.display  = 'none';
    if (adminLink) adminLink.style.display  = 'none';
  }
}

// ─── INIT ON PAGE LOAD ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const adminLink = document.getElementById('adminLink');
  if (adminLink) adminLink.href = 'admin.html';

  const { data: { user } } = await _supabase.auth.getUser();
  updateAuthUI(user);

  _supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session?.user ?? null);
  });
});

// ─── MODAL HELPERS ────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }
function switchModal(from, to) { closeModal(from); openModal(to); }

// ─── TOAST ────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg, type = 'success') {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
