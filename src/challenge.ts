import { createClient, type Session } from '@supabase/supabase-js';
import { mergeCompletedDays, normaliseCompletedDays } from './challengeProgress';

const GUEST_STORAGE_KEY = 'playforge-seven-day-challenge-v1';
const ACCOUNT_CACHE_PREFIX = 'playforge-seven-day-challenge-v1:account:';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

type PendingChange = { completed: boolean; version: number };
const checks = [...document.querySelectorAll<HTMLInputElement>('[data-day]')];
const fill = document.getElementById('progressFill') as HTMLElement;
const progressText = document.getElementById('progressText') as HTMLElement;
const track = document.getElementById('progressTrack') as HTMLElement;
const shareStatus = document.getElementById('shareStatus') as HTMLElement;
const heroDayCount = document.getElementById('heroDayCount') as HTMLElement;
const heroProgress = document.getElementById('heroProgress') as HTMLElement;
const heroProgressFill = document.getElementById('heroProgressFill') as HTMLElement;
const heroProgressLabel = document.getElementById('heroProgressLabel') as HTMLElement;
const accountButton = document.getElementById('accountButton') as HTMLButtonElement;
const accountModal = document.getElementById('accountModal') as HTMLElement;
const authFormPanel = document.getElementById('authFormPanel') as HTMLElement;
const signedInPanel = document.getElementById('signedInPanel') as HTMLElement;
const signedInEmail = document.getElementById('signedInEmail') as HTMLElement;
const authForm = document.getElementById('challengeAuthForm') as HTMLFormElement;
const authEmail = document.getElementById('challengeEmail') as HTMLInputElement;
const authPassword = document.getElementById('challengePassword') as HTMLInputElement;
const authSubmit = document.getElementById('challengeAuthSubmit') as HTMLButtonElement;
const authFeedback = document.getElementById('accountFeedback') as HTMLElement;
const authModeToggle = document.getElementById('toggleAuthMode') as HTMLButtonElement;
const forgotPassword = document.getElementById('forgotPassword') as HTMLButtonElement;
const syncStatus = document.getElementById('syncStatus') as HTMLElement;
const retrySync = document.getElementById('retrySync') as HTMLButtonElement;
const deviceImport = document.getElementById('deviceImport') as HTMLElement;
const deviceImportText = document.getElementById('deviceImportText') as HTMLElement;
const importDeviceButton = document.getElementById('importDeviceProgress') as HTMLButtonElement;
const signOutButton = document.getElementById('challengeSignOut') as HTMLButtonElement;

let activeSession: Session | null = null;
let activeUserId: string | null = null;
let activeDays = readStoredDays(GUEST_STORAGE_KEY);
let authMode: 'signin' | 'signup' = 'signin';
let loadingAccount = false;
let authBusy = false;
let loadVersion = 0;
let writeVersion = 0;
let writeQueue: Promise<void> = Promise.resolve();
const pendingChanges = new Map<number, PendingChange>();

function readStoredDays(key: string): number[] {
  try { return normaliseCompletedDays(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return []; }
}

function writeStoredDays(key: string, days: number[]): void {
  try { localStorage.setItem(key, JSON.stringify(normaliseCompletedDays(days))); }
  catch { /* Keep the current run usable if browser storage is unavailable. */ }
}

function accountCacheKey(userId: string): string {
  return ACCOUNT_CACHE_PREFIX + userId;
}

function renderProgress(): void {
  const completed = activeDays.length;
  const percent = completed / 7 * 100;
  fill.style.width = percent + '%';
  progressText.textContent = completed + ' of 7 complete';
  track.setAttribute('aria-valuenow', String(completed));
  heroDayCount.textContent = completed + ' / 7';
  heroProgressFill.style.width = percent + '%';
  heroProgress.setAttribute('aria-valuenow', String(completed));
  heroProgressLabel.textContent = completed + (completed === 1 ? ' day cleared' : ' days cleared');
  checks.forEach(input => {
    input.checked = activeDays.includes(Number(input.dataset.day));
    input.disabled = loadingAccount;
    input.closest('.day')?.classList.toggle('done', input.checked);
  });
}

function setSyncStatus(message: string, state: 'guest' | 'loading' | 'saving' | 'saved' | 'error'): void {
  syncStatus.textContent = message;
  syncStatus.dataset.state = state;
  retrySync.hidden = state !== 'error' || !activeUserId;
}

function renderImportPrompt(): void {
  if (!activeUserId || !activeSession) {
    deviceImport.hidden = true;
    return;
  }
  const guestDays = readStoredDays(GUEST_STORAGE_KEY);
  const cachedDays = readStoredDays(accountCacheKey(activeUserId));
  const deviceDays = mergeCompletedDays(guestDays, cachedDays);
  const missing = deviceDays.filter(day => !activeDays.includes(day));
  deviceImport.hidden = missing.length === 0;
  if (missing.length) {
    deviceImportText.textContent = `${missing.length} saved day${missing.length === 1 ? '' : 's'} on this device are not in your account yet. You can merge them without replacing cloud progress.`;
  }
}

function renderAccountState(): void {
  const signedIn = Boolean(activeSession?.user.id);
  authFormPanel.hidden = signedIn;
  signedInPanel.hidden = !signedIn;
  if (signedIn) {
    const email = activeSession?.user.email || 'Your PLAYFORGE account';
    signedInEmail.textContent = email;
    accountButton.textContent = 'Account · ' + (email.includes('@') ? email.split('@')[0] : 'signed in');
    accountButton.title = email;
  } else {
    accountButton.textContent = supabase ? 'Sign in to sync' : 'Cloud sync unavailable';
    accountButton.disabled = !supabase;
    accountButton.title = supabase ? 'Sign in to sync progress across devices' : 'Supabase account configuration is missing on this deployment';
  }
  renderImportPrompt();
}

async function loadAccount(nextSession: Session | null): Promise<void> {
  const run = ++loadVersion;
  activeSession = nextSession;
  activeUserId = nextSession?.user.id || null;
  pendingChanges.clear();
  writeQueue = Promise.resolve();
  renderAccountState();

  if (!activeUserId || !supabase) {
    loadingAccount = false;
    activeDays = readStoredDays(GUEST_STORAGE_KEY);
    renderProgress();
    setSyncStatus(
      supabase ? 'Guest run · saved on this device. Sign in to sync across devices.' : 'Guest run · saved on this device. Account sync is not configured here.',
      'guest'
    );
    return;
  }

  loadingAccount = true;
  checks.forEach(input => { input.disabled = true; });
  setSyncStatus('Loading your private challenge progress…', 'loading');
  try {
    const { data, error } = await supabase
      .from('challenge_day_completions')
      .select('day_index')
      .eq('user_id', activeUserId)
      .order('day_index');
    if (run !== loadVersion) return;
    if (error) throw error;
    activeDays = normaliseCompletedDays((data || []).map(row => Number(row.day_index)));
    loadingAccount = false;
    renderProgress();
    setSyncStatus(`Cloud synced · ${nextSession?.user.email || 'your account'}`, 'saved');
    renderAccountState();
  } catch (error) {
    if (run !== loadVersion) return;
    loadingAccount = false;
    renderProgress();
    setSyncStatus(
      error instanceof Error ? `Could not load cloud progress: ${error.message}` : 'Could not load cloud progress. Retry to continue.',
      'error'
    );
  }
}

function queueAccountWrite(userId: string): void {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    if (!supabase || activeUserId !== userId) return;
    const changes = [...pendingChanges.entries()];
    for (const [dayIndex, change] of changes) {
      if (activeUserId !== userId) return;
      const result = change.completed
        ? await supabase.from('challenge_day_completions').upsert(
            { user_id: userId, day_index: dayIndex },
            { onConflict: 'user_id,day_index', ignoreDuplicates: true }
          )
        : await supabase.from('challenge_day_completions')
            .delete()
            .eq('user_id', userId)
            .eq('day_index', dayIndex);
      if (activeUserId !== userId) return;
      if (result.error) {
        setSyncStatus(`Sync failed: ${result.error.message}. Your change is still on this device; retry sync.`, 'error');
        return;
      }
      if (pendingChanges.get(dayIndex)?.version === change.version) pendingChanges.delete(dayIndex);
    }
    if (pendingChanges.size === 0) {
      try { localStorage.removeItem(accountCacheKey(userId)); } catch { /* Ignore unavailable storage. */ }
      setSyncStatus(`Cloud synced · ${activeSession?.user.email || 'your account'}`, 'saved');
    }
  });
}

function saveChangedDay(dayIndex: number, completed: boolean): void {
  activeDays = completed
    ? mergeCompletedDays(activeDays, [dayIndex])
    : activeDays.filter(day => day !== dayIndex);
  renderProgress();

  if (!activeUserId || !supabase) {
    writeStoredDays(GUEST_STORAGE_KEY, activeDays);
    setSyncStatus('Guest run · saved on this device. Sign in to sync across devices.', 'guest');
    return;
  }

  writeStoredDays(accountCacheKey(activeUserId), activeDays);
  pendingChanges.set(dayIndex, { completed, version: ++writeVersion });
  setSyncStatus('Saving your progress to your account…', 'saving');
  queueAccountWrite(activeUserId);
}

async function importDeviceProgress(): Promise<void> {
  if (!activeUserId || !supabase) return;
  const merged = mergeCompletedDays(
    activeDays,
    readStoredDays(GUEST_STORAGE_KEY),
    readStoredDays(accountCacheKey(activeUserId))
  );
  const missing = merged.filter(day => !activeDays.includes(day));
  if (!missing.length) { renderImportPrompt(); return; }

  activeDays = merged;
  renderProgress();
  writeStoredDays(accountCacheKey(activeUserId), activeDays);
  missing.forEach(day => pendingChanges.set(day, { completed: true, version: ++writeVersion }));
  setSyncStatus('Merging this device’s progress into your account…', 'saving');
  queueAccountWrite(activeUserId);
  renderImportPrompt();
}

function showAccountModal(): void {
  accountModal.hidden = false;
  document.body.style.overflow = 'hidden';
  renderAccountState();
  if (!activeSession) window.setTimeout(() => authEmail.focus(), 30);
}

function closeAccountModal(): void {
  accountModal.hidden = true;
  document.body.style.overflow = '';
  authFeedback.textContent = '';
  authFeedback.dataset.error = 'false';
}

function showAuthFeedback(message: string, isError = false): void {
  authFeedback.textContent = message;
  authFeedback.dataset.error = String(isError);
}

function setAuthMode(mode: 'signin' | 'signup'): void {
  authMode = mode;
  authSubmit.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
  authPassword.autocomplete = mode === 'signin' ? 'current-password' : 'new-password';
  authModeToggle.textContent = mode === 'signin'
    ? 'New to PLAYFORGE? Create an account'
    : 'Already have an account? Sign in';
  forgotPassword.hidden = mode !== 'signin';
  showAuthFeedback('');
}

async function submitAuth(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!supabase || authBusy) return;
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) return;

  authBusy = true;
  authSubmit.disabled = true;
  authSubmit.textContent = authMode === 'signin' ? 'Signing in…' : 'Creating account…';
  showAuthFeedback('');
  try {
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      if (!data.session) {
        showAuthFeedback('Account created. Check your email to confirm it, then return here and sign in.');
      } else {
        showAuthFeedback('Account created. Loading your private challenge progress…');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showAuthFeedback('Signed in. Loading your progress…');
    }
  } catch (error) {
    showAuthFeedback(error instanceof Error ? error.message : 'Could not authenticate this account.', true);
  } finally {
    authBusy = false;
    authSubmit.disabled = false;
    authSubmit.textContent = authMode === 'signin' ? 'Sign in' : 'Create account';
  }
}

async function requestPasswordReset(): Promise<void> {
  if (!supabase) return;
  const email = authEmail.value.trim();
  if (!email) { showAuthFeedback('Enter your email address first.', true); return; }
  forgotPassword.disabled = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) throw error;
    showAuthFeedback('If an account exists for that email, a reset link has been sent. Finish the reset in the PLAYFORGE app.');
  } catch (error) {
    showAuthFeedback(error instanceof Error ? error.message : 'Could not send a password reset link.', true);
  } finally {
    forgotPassword.disabled = false;
  }
}

async function signOut(): Promise<void> {
  if (!supabase) return;
  signOutButton.disabled = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    closeAccountModal();
  } catch (error) {
    showAuthFeedback(error instanceof Error ? error.message : 'Could not sign out.', true);
  } finally {
    signOutButton.disabled = false;
  }
}

const invite = "I'm trying the free PLAYFORGE 7-Day Level Up: seven days of small, realistic actions to build a routine that fits real life. Join me: https://playforge-fawn.vercel.app/challenge/";
async function shareChallenge(): Promise<void> {
  const data = { title: 'The 7-Day Level Up — PLAYFORGE', text: invite, url: 'https://playforge-fawn.vercel.app/challenge/' };
  try {
    if (navigator.share) await navigator.share(data);
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(invite);
      shareStatus.textContent = 'Invite copied. Paste it into your message.';
    } else shareStatus.textContent = invite;
  } catch (error) {
    if (error && (error as DOMException).name !== 'AbortError') shareStatus.textContent = 'Could not open sharing. Copy the page address instead.';
  }
}

checks.forEach(input => input.addEventListener('change', () => {
  const dayIndex = Number(input.dataset.day);
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    input.checked = false;
    return;
  }
  saveChangedDay(dayIndex, input.checked);
}));

document.getElementById('shareTop')?.addEventListener('click', () => void shareChallenge());
document.getElementById('copyInvite')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(invite);
    shareStatus.textContent = 'Invite copied. Paste it into your message.';
  } catch { shareStatus.textContent = invite; }
});
accountButton.addEventListener('click', showAccountModal);
document.getElementById('closeAccountModal')?.addEventListener('click', closeAccountModal);
document.getElementById('accountBackdrop')?.addEventListener('click', closeAccountModal);
authForm.addEventListener('submit', event => void submitAuth(event));
authModeToggle.addEventListener('click', () => setAuthMode(authMode === 'signin' ? 'signup' : 'signin'));
forgotPassword.addEventListener('click', () => void requestPasswordReset());
signOutButton.addEventListener('click', () => void signOut());
importDeviceButton.addEventListener('click', () => void importDeviceProgress());
retrySync.addEventListener('click', () => {
  if (activeUserId) {
    pendingChanges.forEach((value, dayIndex) => pendingChanges.set(dayIndex, { ...value, version: ++writeVersion }));
    queueAccountWrite(activeUserId);
  } else {
    void loadAccount(activeSession);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !accountModal.hidden) closeAccountModal();
});

if (supabase) {
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    // Keep Supabase's auth callback synchronous; do data I/O after it returns.
    window.setTimeout(() => void loadAccount(nextSession), 0);
  });
  window.addEventListener('pagehide', () => {
    void writeQueue.catch(() => undefined);
    authListener.subscription.unsubscribe();
  }, { once: true });
  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) setSyncStatus(`Could not read sign-in state: ${error.message}`, 'error');
    else void loadAccount(data.session);
  });
} else {
  accountButton.disabled = true;
  setSyncStatus('Guest run · saved on this device. Cloud account sync is not configured on this deployment.', 'guest');
}

renderProgress();
renderAccountState();
