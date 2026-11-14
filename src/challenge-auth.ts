import { createClient, type Session } from '@supabase/supabase-js';
import { normalizeChallengeDays, parseLegacyChallengeDays } from './challenge-progress';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      // Keep the exact project-derived storage key and defaults used by
      // PLAYFORGE's MultiUserApp. Both pages are on the same origin.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const authLoading = $('authLoading');
const authGate = $('authGate');
const authForm = $('challengeAuthForm') as HTMLFormElement;
const authTitle = $('authTitle');
const authDescription = $('authDescription');
const authEmail = $('authEmail') as HTMLInputElement;
const authPassword = $('authPassword') as HTMLInputElement;
const authEmailLabel = $('authEmailLabel');
const authPasswordLabel = $('authPasswordLabel');
const authSubmit = $('authSubmit') as HTMLButtonElement;
const authModeToggle = $('authModeToggle') as HTMLButtonElement;
const authForgotPassword = $('authForgotPassword') as HTMLButtonElement;
const authFeedback = $('authFeedback');
const challengeContent = $('challengeContent');
const challengeFooter = $('challengeFooter');
const challengeAccountBar = $('challengeAccountBar');
const challengeUserEmail = $('challengeUserEmail');
const challengeSignOut = $('challengeSignOut') as HTMLButtonElement;
const challengeStatus = $('challengeStatus');
const challengeRetry = $('challengeRetry') as HTMLButtonElement;
const legacyImport = $('legacyImport');
const legacyAccountEmail = $('legacyAccountEmail');
const legacyImportButton = $('legacyImportButton') as HTMLButtonElement;
const legacyDiscardButton = $('legacyDiscardButton') as HTMLButtonElement;
const dayInputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-day]'));

const LEGACY_STORAGE_KEY = 'playforge-seven-day-challenge-v1';
let legacyDays: number[] = [];
try {
  legacyDays = parseLegacyChallengeDays(localStorage.getItem(LEGACY_STORAGE_KEY));
} catch {
  legacyDays = [];
}

type AuthMode = 'signin' | 'signup' | 'recovery';
let authMode: AuthMode = 'signin';
let recoveryMode = false;
let activeUserId: string | null = null;
let challengeReady = false;
let loadVersion = 0;

function setAuthFeedback(message: string, isError = false) {
  authFeedback.textContent = message;
  authFeedback.classList.toggle('is-error', isError);
  authFeedback.classList.toggle('is-success', Boolean(message) && !isError);
}

function setChallengeStatus(message: string, isError = false) {
  challengeStatus.textContent = message;
  challengeStatus.hidden = !message;
  challengeStatus.classList.toggle('is-error', isError);
  challengeRetry.hidden = !isError;
}

function renderAuthMode() {
  const isRecovery = authMode === 'recovery';
  const isSignup = authMode === 'signup';

  authTitle.textContent = isRecovery
    ? 'Choose a new password.'
    : isSignup
      ? 'Create your PLAYFORGE account.'
      : 'Welcome back, player.';
  authDescription.textContent = isRecovery
    ? 'This password will work for both PLAYFORGE and the 7-Day Challenge.'
    : isSignup
      ? 'Create one account for PLAYFORGE and the Challenge. You will use the same sign-in on both.'
      : 'Use the same email and password you already use in PLAYFORGE. If you are signed in there on this browser, this page opens automatically.';
  authEmailLabel.hidden = isRecovery;
  authPasswordLabel.querySelector('span')!.textContent = isRecovery ? 'NEW PASSWORD' : 'PASSWORD';
  authPassword.autocomplete = isRecovery || isSignup ? 'new-password' : 'current-password';
  authPassword.minLength = 8;
  authSubmit.textContent = isRecovery ? 'Update password' : isSignup ? 'Create account' : 'Sign in';
  authModeToggle.hidden = isRecovery;
  authForgotPassword.hidden = authMode !== 'signin';
  authModeToggle.textContent = isSignup
    ? 'Already have a PLAYFORGE account? Sign in'
    : 'New to PLAYFORGE? Create an account';
}

function showSignedOut() {
  loadVersion += 1;
  activeUserId = null;
  challengeReady = false;
  authLoading.hidden = true;
  authGate.hidden = false;
  challengeContent.hidden = true;
  challengeFooter.hidden = true;
  challengeAccountBar.hidden = true;
  legacyImport.hidden = true;
  dayInputs.forEach((input) => {
    input.checked = false;
    input.disabled = true;
    input.closest('.day')?.classList.remove('done');
  });
  updateProgress();
  if (!recoveryMode) {
    authMode = 'signin';
    renderAuthMode();
  }
}

function updateProgress() {
  const completed = dayInputs.filter((input) => input.checked).length;
  const percent = (completed / 7) * 100;
  const fill = $('progressFill') as HTMLElement;
  const progressText = $('progressText');
  const track = $('progressTrack');
  const heroDayCount = $('heroDayCount');
  const heroProgress = $('heroProgress');
  const heroProgressFill = $('heroProgressFill') as HTMLElement;
  const heroProgressLabel = $('heroProgressLabel');

  fill.style.width = percent + '%';
  progressText.textContent = completed + ' of 7 complete';
  track.setAttribute('aria-valuenow', String(completed));
  heroDayCount.textContent = completed + ' / 7';
  heroProgressFill.style.width = percent + '%';
  heroProgress.setAttribute('aria-valuenow', String(completed));
  heroProgressLabel.textContent = completed + (completed === 1 ? ' day cleared' : ' days cleared');
  dayInputs.forEach((input) => input.closest('.day')?.classList.toggle('done', input.checked));
}

function applyDays(days: number[]) {
  const normalized = normalizeChallengeDays(days);
  dayInputs.forEach((input) => {
    input.checked = normalized.includes(Number(input.dataset.day));
    input.disabled = false;
  });
  updateProgress();
}

async function loadChallengeForUser(userId: string, version: number) {
  if (!supabase) return;
  setChallengeStatus('Loading your saved challenge days…');

  const { data, error } = await supabase
    .from('challenge_day_completions')
    .select('day_index')
    .eq('user_id', userId);

  if (version !== loadVersion || activeUserId !== userId) return;
  if (error) {
    dayInputs.forEach((input) => { input.disabled = true; });
    setChallengeStatus('We could not load your saved challenge progress. Check your connection and retry.', true);
    return;
  }

  applyDays(normalizeChallengeDays((data || []).map((row) => row.day_index)));
  challengeReady = true;
  authLoading.hidden = true;
  authGate.hidden = true;
  challengeContent.hidden = false;
  challengeFooter.hidden = false;
  challengeAccountBar.hidden = false;
  challengeUserEmail.textContent = $('challengeUserEmail').textContent || '';
  setChallengeStatus('');

  if (legacyDays.length) {
    legacyAccountEmail.textContent = $('challengeUserEmail').textContent || 'this account';
    legacyImport.hidden = false;
  } else {
    legacyImport.hidden = true;
  }
}

async function handleSession(session: Session | null) {
  if (!session) {
    showSignedOut();
    return;
  }

  const userId = session.user.id;
  challengeUserEmail.textContent = session.user.email || 'Signed-in player';

  if (recoveryMode) {
    loadVersion += 1;
    activeUserId = userId;
    authLoading.hidden = true;
    authGate.hidden = false;
    challengeContent.hidden = true;
    challengeFooter.hidden = true;
    challengeAccountBar.hidden = true;
    legacyImport.hidden = true;
    authMode = 'recovery';
    renderAuthMode();
    return;
  }

  if (activeUserId === userId && challengeReady) return;

  activeUserId = userId;
  challengeReady = false;
  const version = ++loadVersion;
  authLoading.hidden = false;
  authGate.hidden = true;
  challengeContent.hidden = true;
  challengeFooter.hidden = true;
  challengeAccountBar.hidden = true;
  await loadChallengeForUser(userId, version);
}

async function submitAuth(event: SubmitEvent) {
  event.preventDefault();
  if (!supabase) return;

  authSubmit.disabled = true;
  authModeToggle.disabled = true;
  authForgotPassword.disabled = true;
  setAuthFeedback('');

  try {
    if (authMode === 'recovery') {
      const { error } = await supabase.auth.updateUser({ password: authPassword.value });
      if (error) throw error;
      recoveryMode = false;
      authPassword.value = '';
      authMode = 'signin';
      renderAuthMode();
      setAuthFeedback('Password updated. This is now your password in both PLAYFORGE and the Challenge.');
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      await handleSession(data.session);
      return;
    }

    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Use the same Site URL already used by PLAYFORGE confirmation links.
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      if (!data.session) {
        setAuthFeedback('Account created. Check your email and confirm it once. That same account will then work in both PLAYFORGE and the Challenge.');
      } else {
        setAuthFeedback('Account created. Opening your 7-Day Challenge…');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthFeedback('Signed in. Loading your saved challenge…');
    }
  } catch (error) {
    setAuthFeedback(error instanceof Error ? error.message : 'Could not complete sign-in. Please try again.', true);
  } finally {
    authSubmit.disabled = false;
    authModeToggle.disabled = false;
    authForgotPassword.disabled = false;
  }
}

async function requestPasswordReset() {
  if (!supabase) return;
  const email = authEmail.value.trim();
  if (!email) {
    setAuthFeedback('Enter the email address for your PLAYFORGE account first.', true);
    authEmail.focus();
    return;
  }

  authForgotPassword.disabled = true;
  setAuthFeedback('');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    setAuthFeedback('If an account exists for that address, a password reset link has been sent. The new password will work in both apps.');
  } catch (error) {
    setAuthFeedback(error instanceof Error ? error.message : 'Could not send the password reset email.', true);
  } finally {
    authForgotPassword.disabled = false;
  }
}

async function signOut() {
  if (!supabase) return;
  challengeSignOut.disabled = true;
  try {
    // This is intentionally the shared PLAYFORGE session: signing out here
    // also signs this browser out of the main PLAYFORGE app.
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    setChallengeStatus(error instanceof Error ? error.message : 'Could not sign out.', true);
  } finally {
    challengeSignOut.disabled = false;
  }
}

async function saveDay(input: HTMLInputElement) {
  if (!supabase || !activeUserId || !challengeReady) {
    input.checked = !input.checked;
    updateProgress();
    setChallengeStatus('Sign in to your PLAYFORGE account to save challenge progress.', true);
    return;
  }

  const userId = activeUserId;
  const dayIndex = Number(input.dataset.day);
  const desiredChecked = input.checked;
  input.disabled = true;

  try {
    if (desiredChecked) {
      const { error } = await supabase.from('challenge_day_completions').insert({
        user_id: userId,
        day_index: dayIndex,
      });
      // A duplicate insert means the day is already saved; no UPDATE policy
      // is needed because this feature only inserts and deletes completion rows.
      if (error && error.code !== '23505') throw error;
    } else {
      const { error } = await supabase
        .from('challenge_day_completions')
        .delete()
        .eq('user_id', userId)
        .eq('day_index', dayIndex);
      if (error) throw error;
    }

    if (activeUserId !== userId) return;
    setChallengeStatus('');
    updateProgress();
  } catch (error) {
    if (activeUserId === userId) {
      input.checked = !desiredChecked;
      updateProgress();
      setChallengeStatus(error instanceof Error ? error.message : 'Could not save that challenge day. Please try again.', true);
    }
  } finally {
    input.disabled = false;
  }
}

async function importLegacyProgress() {
  if (!supabase || !activeUserId) return;
  legacyImportButton.disabled = true;
  legacyDiscardButton.disabled = true;

  try {
    for (const dayIndex of legacyDays) {
      const { error } = await supabase.from('challenge_day_completions').insert({
        user_id: activeUserId,
        day_index: dayIndex,
      });
      if (error && error.code !== '23505') throw error;
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    legacyDays = [];
    legacyImport.hidden = true;
    await loadChallengeForUser(activeUserId, ++loadVersion);
  } catch (error) {
    setChallengeStatus(error instanceof Error ? error.message : 'Could not import the previous checklist.', true);
  } finally {
    legacyImportButton.disabled = false;
    legacyDiscardButton.disabled = false;
  }
}

function discardLegacyProgress() {
  try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
  legacyDays = [];
  legacyImport.hidden = true;
}

// Challenge data is independent from PLAYFORGE's player_data save.
dayInputs.forEach((input) => input.addEventListener('change', () => void saveDay(input)));
authForm.addEventListener('submit', (event) => void submitAuth(event));
authModeToggle.addEventListener('click', () => {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  setAuthFeedback('');
  authPassword.value = '';
  renderAuthMode();
});
authForgotPassword.addEventListener('click', () => void requestPasswordReset());
challengeSignOut.addEventListener('click', () => void signOut());
challengeRetry.addEventListener('click', () => {
  if (activeUserId) void loadChallengeForUser(activeUserId, ++loadVersion);
});
legacyImportButton.addEventListener('click', () => void importLegacyProgress());
legacyDiscardButton.addEventListener('click', discardLegacyProgress);

renderAuthMode();

if (!supabase) {
  authLoading.hidden = true;
  authGate.hidden = false;
  setAuthFeedback('Account sign-in is not configured on this deployment. Please contact the PLAYFORGE team.', true);
} else {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') recoveryMode = true;
    if (event === 'SIGNED_OUT') recoveryMode = false;
    // Defer work outside the Auth callback to avoid locking the Supabase client.
    window.setTimeout(() => void handleSession(session), 0);
  });

  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) setAuthFeedback(error.message, true);
    void handleSession(data.session);
  });

  window.addEventListener('pagehide', () => authListener.subscription.unsubscribe(), { once: true });
}
