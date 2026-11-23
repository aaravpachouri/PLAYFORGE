import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import App from '../App';
import { Flame, Swords, TrendingUp } from 'lucide-react';

const STORAGE_KEY = 'playforge.v1';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

type SyncState = 'loading' | 'ready' | 'syncing' | 'error';

function pfStars(count: number, seed: number): string {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    shadows.push(`${(rand() * 100).toFixed(2)}vw ${(rand() * 100).toFixed(2)}vh 0 0px rgba(255,255,255,${(0.3 + rand() * 0.55).toFixed(2)})`);
  }
  return shadows.join(',');
}
const INTRO_STARS_A = pfStars(110, 123457);
const INTRO_STARS_B = pfStars(60, 987653);
const INTRO_CSS = `
body{position:relative}
.dailylaunch-badge{position:absolute;right:24px;bottom:24px}
.pf-intro{position:relative;min-height:100vh;background:#07060d;color:#f7f5ff;font-family:Inter,system-ui,sans-serif;overflow-x:hidden}
.pf-sky{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(120% 90% at 50% -10%,#2a1b52 0%,#150f2b 42%,#07060d 78%)}
.pf-orb{position:absolute;border-radius:50%;filter:blur(70px)}
.pf-orb-a{width:52vw;height:52vw;min-width:420px;min-height:420px;left:-12%;top:-16%;background:radial-gradient(circle at 35% 35%,rgba(139,92,246,.5),rgba(76,29,149,0) 70%);animation:pf-drift-a 22s ease-in-out infinite alternate}
.pf-orb-b{width:44vw;height:44vw;min-width:360px;min-height:360px;right:-10%;bottom:-14%;background:radial-gradient(circle at 60% 40%,rgba(56,189,248,.32),rgba(14,116,144,0) 70%);animation:pf-drift-b 27s ease-in-out infinite alternate}
.pf-stars{position:absolute;top:0;left:0;width:2px;height:2px;border-radius:50%;background:transparent}
.pf-stars-a{box-shadow:${INTRO_STARS_A};animation:pf-twinkle 4.5s ease-in-out infinite}
.pf-stars-b{box-shadow:${INTRO_STARS_B};width:1px;height:1px;animation:pf-twinkle 6.5s ease-in-out infinite 1.2s}
.pf-grain{position:absolute;inset:0;opacity:.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.pf-vignette{position:absolute;inset:0;background:radial-gradient(120% 100% at 50% 40%,transparent 55%,rgba(3,2,8,.75) 100%)}
.pf-wrap{position:relative;z-index:1;width:min(1120px,100%);margin:0 auto;padding:0 24px;box-sizing:border-box}
.pf-top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:26px}
.pf-brand{white-space:nowrap}
.pf-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:72px 0 64px;min-height:min(78vh,820px)}
.pf-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.22em;color:#c4b5fd;font-weight:800;padding:8px 14px;border:1px solid rgba(196,181,253,.25);border-radius:999px;background:rgba(139,92,246,.08)}
.pf-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:#a78bfa;box-shadow:0 0 10px 2px rgba(167,139,250,.8);animation:pf-pulse-glow 3.2s ease-in-out infinite}
.pf-title{font-size:clamp(40px,7vw,74px);line-height:1.02;letter-spacing:-.02em;font-weight:900;margin:20px 0 18px;background:linear-gradient(115deg,#fff 25%,#d9ccff 55%,#8b5cf6 95%);-webkit-background-clip:text;background-clip:text;color:transparent;text-wrap:balance}
.pf-sub{font-size:17px;line-height:1.6;color:#b9b4cc;max-width:46ch;margin:0}
.pf-cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
.pf-account-note{flex-basis:100%;margin:0;color:#9e98b8;font-size:12px;line-height:1.6;max-width:52ch}
.pf-primary{padding:16px 26px;border:0;border-radius:14px;background:linear-gradient(110deg,#8b5cf6,#6d48d8,#8b5cf6);background-size:220% 220%;color:#fff;font-weight:800;font-size:15px;letter-spacing:.02em;cursor:pointer;box-shadow:0 12px 44px rgba(139,92,246,.45),inset 0 1px 0 rgba(255,255,255,.25);animation:pf-sheen 7s ease-in-out infinite;transition:transform .18s ease,box-shadow .18s ease}
.pf-primary:hover{transform:translateY(-2px);box-shadow:0 18px 54px rgba(139,92,246,.6),inset 0 1px 0 rgba(255,255,255,.25)}
.pf-ghost{white-space:nowrap;padding:12px 20px;border:1px solid rgba(196,181,253,.3);border-radius:12px;background:rgba(19,16,32,.5);backdrop-filter:blur(8px);color:#d8ceff;font-weight:700;font-size:14px;cursor:pointer;transition:border-color .18s ease,background .18s ease}
.pf-ghost:hover{border-color:rgba(196,181,253,.6);background:rgba(139,92,246,.14)}
.pf-ghost-lg{padding:16px 22px;font-size:15px}
.pf-stage{position:relative;display:grid;place-items:center;min-height:340px}
.pf-card-glow{position:absolute;width:78%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.38),rgba(139,92,246,0) 65%);filter:blur(30px);animation:pf-pulse-glow 5s ease-in-out infinite}
.pf-card-float{animation:pf-float 8s ease-in-out infinite}
.pf-quest{position:relative;width:min(380px,100%);padding:24px;border-radius:22px;background:linear-gradient(160deg,rgba(32,26,54,.85),rgba(16,13,28,.9));border:1px solid rgba(167,139,250,.3);box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 0 1px rgba(139,92,246,.12),0 0 60px rgba(139,92,246,.18);backdrop-filter:blur(16px);transform:rotate(-2.5deg);box-sizing:border-box}
.pf-quest-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.pf-quest-tag{font-size:9px;letter-spacing:.18em;font-weight:800;color:#a78bfa;padding:5px 10px;border-radius:999px;border:1px solid rgba(167,139,250,.35);background:rgba(139,92,246,.12)}
.pf-quest-xp{font-size:11px;font-weight:900;color:#fbbf24;text-shadow:0 0 14px rgba(251,191,36,.6)}
.pf-quest-title{font-size:24px;margin:14px 0 8px;letter-spacing:-.01em}
.pf-quest-sub{font-size:13.5px;line-height:1.55;color:#a8a3bd;margin:0 0 18px}
.pf-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;position:relative}
.pf-bar-fill{height:100%;width:64%;border-radius:999px;background:linear-gradient(90deg,#6d48d8,#a78bfa,#e9d5ff);position:relative;overflow:hidden}
.pf-bar-shimmer{position:absolute;top:0;bottom:0;width:34%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:pf-shimmer 3.4s ease-in-out infinite}
.pf-bar-meta{display:flex;justify-content:space-between;margin-top:10px;font-size:9.5px;letter-spacing:.14em;font-weight:800;color:#8f8aa5}
.pf-features{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:8px 0 0}
.pf-feature{padding:22px;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px);transition:transform .2s ease,border-color .2s ease,background .2s ease}
.pf-feature:hover{transform:translateY(-4px);border-color:rgba(167,139,250,.4);background:rgba(139,92,246,.09)}
.pf-feature strong{display:block;font-size:15px;margin:14px 0 6px}
.pf-feature p{margin:0;font-size:13.5px;line-height:1.5;color:#a8a3bd}
.pf-icon{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:12px;color:#e9d5ff;background:linear-gradient(140deg,rgba(139,92,246,.5),rgba(109,72,216,.25));border:1px solid rgba(167,139,250,.4);box-shadow:0 6px 20px rgba(139,92,246,.3)}
.pf-final{display:grid;justify-items:center;gap:14px;padding:56px 0 150px;text-align:center}
.pf-fine{color:#8f8aa5;font-size:13px;margin:0}
.pf-e1{animation:pf-rise .7s .05s cubic-bezier(.2,.7,.3,1) both}
.pf-e2{animation:pf-rise .7s .15s cubic-bezier(.2,.7,.3,1) both}
.pf-e3{animation:pf-rise .8s .25s cubic-bezier(.2,.7,.3,1) both}
.pf-e4{animation:pf-rise .8s .4s cubic-bezier(.2,.7,.3,1) both}
.pf-e5{animation:pf-rise .8s .52s cubic-bezier(.2,.7,.3,1) both}
.pf-e6{animation:pf-rise .8s .64s cubic-bezier(.2,.7,.3,1) both}
@keyframes pf-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes pf-twinkle{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes pf-drift-a{0%{transform:translate3d(-6%,-4%,0) scale(1)}100%{transform:translate3d(5%,6%,0) scale(1.12)}}
@keyframes pf-drift-b{0%{transform:translate3d(4%,5%,0) scale(1.05)}100%{transform:translate3d(-5%,-6%,0) scale(1)}}
@keyframes pf-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pf-sheen{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pf-shimmer{from{transform:translateX(-120%)}to{transform:translateX(320%)}}
@keyframes pf-pulse-glow{0%,100%{opacity:.55}50%{opacity:.9}}
@media (max-width:880px){
.pf-brand{font-size:11px!important;letter-spacing:.14em!important}
.pf-eyebrow{font-size:9px;letter-spacing:.15em;padding:7px 12px}
.pf-top{padding-top:20px}
.pf-hero{grid-template-columns:1fr;gap:44px;padding:56px 0 48px;min-height:0}
.pf-stage{min-height:0}
.pf-features{grid-template-columns:1fr}
.pf-title{font-size:clamp(38px,11vw,54px)}
}
@media (prefers-reduced-motion:reduce){
.pf-intro *,.pf-intro *::before,.pf-intro *::after{animation:none!important;transition:none!important}
}
`;

function AuthShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>(() => (window.location.hash === '#signup' ? 'signup' : 'signin'));
  const [showIntro, setShowIntro] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return !(q.has('signin') || q.has('auth') || window.location.hash === '#signin' || window.location.hash === '#signup');
  });
  const [signupIntent, setSignupIntent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [legacyData, setLegacyData] = useState<string | null>(null);
  const [hydratedUser, setHydratedUser] = useState<string | null>(null);
  const hydrationId = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeUser = useRef<string | null>(null);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    const run = ++hydrationId.current;
    const userId = nextSession?.user.id || null;
    activeUser.current = null;
    setSession(nextSession);
    setHydratedUser(null);
    setLegacyData(null);
    if (!userId || !supabase) {
      localStorage.removeItem(STORAGE_KEY);
      setSyncState('ready');
      setBooting(false);
      return;
    }

    setSyncState('loading');
    setBooting(true);
    try {
      const { data, error: readError } = await supabase
        .from('player_data')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();
      if (run !== hydrationId.current) return;
      if (readError) throw readError;

      if (data?.data && typeof data.data === 'object') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        activeUser.current = userId;
        setHydratedUser(userId);
        setSyncState('ready');
      } else {
        const oldLocal = localStorage.getItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setLegacyData(oldLocal);
        if (!oldLocal) activeUser.current = userId;
        setHydratedUser(userId);
        setSyncState('ready');
      }
    } catch (e) {
      if (run !== hydrationId.current) return;
      setError(e instanceof Error ? e.message : 'Could not load your cloud save.');
      setSyncState('error');
    } finally {
      if (run === hydrationId.current) setBooting(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) { setBooting(false); return; }
    let alive = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
      if (alive) window.setTimeout(() => { if (alive) void hydrate(nextSession); }, 0);
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      void hydrate(data.session);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hydrate]);

  const saveCloud = useCallback(async (raw: string, userId: string) => {
    if (!supabase || activeUser.current !== userId) return;
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return; }
    const { error: saveError } = await supabase.from('player_data').upsert(
      { user_id: userId, data: parsed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (activeUser.current !== userId) return;
    if (saveError) {
      setSyncState('error');
      setError(saveError.message);
    } else {
      setSyncState('ready');
      setError('');
    }
  }, []);

  useEffect(() => {
    const userId = hydratedUser;
    if (!userId || activeUser.current !== userId) return;
    const onPlayerStateChange = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (typeof value !== 'string' || activeUser.current !== userId) return;
      setSyncState('syncing');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void saveCloud(value, userId), 650);
    };
    window.addEventListener('playforge:state-change', onPlayerStateChange);
    // The main app initialises its browser save at mount. Upload that initial
    // state too, so a newly created account gets a durable cloud record.
    const initialSync = window.setTimeout(() => {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value && activeUser.current === userId) void saveCloud(value, userId);
    }, 200);
    return () => {
      window.removeEventListener('playforge:state-change', onPlayerStateChange);
      window.clearTimeout(initialSync);
    };
  }, [hydratedUser, saveCloud]);

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        setMessage('Account created. Check your email to confirm it, then sign in.');
      } else if (mode === 'signup') {
        setMessage('Account created. Loading your player profile…');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed.');
    } finally { setBusy(false); }
  };

  const requestPasswordReset = async () => {
    if (!supabase) return;
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setMessage('If an account exists for that address, a password reset link has been sent.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the password reset email.');
    } finally { setBusy(false); }
  };

  const saveNewPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) { setError('Use at least 8 characters for your new password.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setRecoveryMode(false);
      setNewPassword('');
      setMessage('Your password has been updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update your password.');
    } finally { setBusy(false); }
  };

  const chooseLegacy = async (shouldImport: boolean) => {
    if (!supabase || !session?.user.id) return;
    setBusy(true); setError('');
    try {
      let value: unknown = null;
      if (shouldImport && legacyData) {
        try { value = JSON.parse(legacyData); }
        catch { throw new Error('The old browser save is damaged and cannot be imported.'); }
      }
      if (shouldImport && value) {
        const { error: writeError } = await supabase.from('player_data').upsert(
          { user_id: session.user.id, data: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
        if (writeError) throw writeError;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      activeUser.current = session.user.id;
      setLegacyData(null);
      setSyncState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not initialise this player profile.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    if (!supabase) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const userId = activeUser.current;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (userId && raw) await saveCloud(raw, userId);
    activeUser.current = null;
    localStorage.removeItem(STORAGE_KEY);
    await supabase.auth.signOut();
  };

  if (!supabase) return <div style={screen}><div style={panel}><Brand/><h1>Cloud accounts need setup</h1><p>Add the two public Supabase project values to your Vercel environment before enabling player accounts.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_PUBLISHABLE_KEY</code><p>Then apply <strong>supabase/migrations/001_player_data.sql</strong> in the Supabase SQL Editor and redeploy. No service-role key belongs in the browser.</p></div></div>;

  if (booting) return <div style={screen}><div style={panel}><Brand/><p>Loading your secure player profile…</p></div></div>;

  if (recoveryMode && session) return <div style={screen}><div style={panel}><Brand/><div style={eyebrow}>ACCOUNT RECOVERY</div><h1>Set a new password.</h1><p>Choose a new password for your PLAYFORGE player account.</p><form onSubmit={saveNewPassword} style={{display:'grid',gap:12}}><label style={label}>NEW PASSWORD<input style={field} type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 8 characters"/></label><button style={primary} disabled={busy}>{busy?'Saving…':'Update password'}</button></form>{error&&<p style={danger}>{error}</p>}{message&&<p style={success}>{message}</p>}</div></div>;

  if (!session && !recoveryMode && showIntro) {
    const go = (m: 'signin' | 'signup') => { if (m === 'signup') setSignupIntent(true); setMode(m); setError(''); setMessage(''); setShowIntro(false); };
    return <div className="pf-intro">
      <style>{INTRO_CSS}</style>
      <div className="pf-sky" aria-hidden="true">
        <div className="pf-orb pf-orb-a" />
        <div className="pf-orb pf-orb-b" />
        <div className="pf-stars pf-stars-a" />
        <div className="pf-stars pf-stars-b" />
        <div className="pf-grain" />
        <div className="pf-vignette" />
      </div>
      <main className="pf-wrap">
        <header className="pf-top pf-e1">
          <div className="pf-brand" style={{ fontSize: 13, fontWeight: 900, letterSpacing: '.24em', color: '#b9a5ff' }}>PLAYFORGE <span style={{ color: '#77758e' }}>/ PLAYER ID</span></div>
          <button type="button" className="pf-ghost" onClick={() => go('signin')}>Sign in</button>
        </header>
        <section className="pf-hero">
          <div className="pf-copy">
            <div className="pf-eyebrow pf-e2"><span className="pf-eyebrow-dot" />FREE · GAME-INSPIRED SELF-IMPROVEMENT</div>
            <h1 className="pf-title pf-e3">Turn your goals into quests.</h1>
            <p className="pf-sub pf-e4">PLAYFORGE helps you build habits, track workouts and daily activity, complete challenges and see your progress, so showing up feels like a game you want to keep playing.</p>
            <div className="pf-cta pf-e5">
              <button type="button" className="pf-primary" onClick={() => go('signup')}>Create your first quest</button>
              <p className="pf-account-note">Free account required to save your quests and XP across devices. Preview the example first.</p>
              <button type="button" className="pf-ghost pf-ghost-lg" onClick={() => go('signin')}>I already have an account</button>
            </div>
          </div>
          <div className="pf-stage pf-e4">
            <div className="pf-card-glow" />
            <div className="pf-card-float">
              <div className="pf-quest">
                <div className="pf-quest-top"><span className="pf-quest-tag">EXAMPLE QUEST · ILLUSTRATIVE</span><span className="pf-quest-xp">+XP</span></div>
                <h2 className="pf-quest-title">Read for 10 minutes</h2>
                <p className="pf-quest-sub">Pick a goal, break it into a small quest, finish it today and log it. Small wins add up over days.</p>
                <div className="pf-bar"><div className="pf-bar-fill"><div className="pf-bar-shimmer" /></div></div>
                <div className="pf-bar-meta"><span>XP PROGRESS · EXAMPLE</span><span>EARNED AS YOU LOG</span></div>
              </div>
            </div>
          </div>
        </section>
        <section className="pf-features pf-e6">
          <div className="pf-feature"><span className="pf-icon"><Swords size={18} strokeWidth={2.2} /></span><strong>Quests and XP</strong><p>Complete missions and earn XP from what you log.</p></div>
          <div className="pf-feature"><span className="pf-icon"><Flame size={18} strokeWidth={2.2} /></span><strong>Habits and workouts</strong><p>Check in daily, log movement and follow training sessions.</p></div>
          <div className="pf-feature"><span className="pf-icon"><TrendingUp size={18} strokeWidth={2.2} /></span><strong>Progress</strong><p>See your own saved activity over time.</p></div>
        </section>
        <section className="pf-final pf-e6">
          <button type="button" className="pf-primary" onClick={() => go('signup')}>Create your first quest</button>
              <p className="pf-account-note">Free account required to save your quests and XP across devices. Preview the example first.</p>
          <p className="pf-fine">PLAYFORGE is a self-reported wellness prototype, not a medical device.</p>
        </section>
      </main>
    </div>;
  }

  if (!session) return <div style={screen}><div style={panel}><Brand/><div style={eyebrow}>YOUR PROGRESS. YOUR ACCOUNT.</div><h1>{mode === 'signin' ? 'Welcome back, player.' : 'Create your player account.'}</h1><p>{mode === 'signup' ? 'A free account lets you save quests, XP and progress across devices.' : 'Sign in to continue with the same quests, XP and progress.'}</p>{mode === 'signup' && signupIntent && <div style={{margin:'0 0 16px',padding:'14px 15px',border:'1px solid rgba(167,139,250,.28)',borderRadius:14,background:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(56,189,248,.06))'}}><div style={{fontSize:10,fontWeight:800,letterSpacing:'.12em',color:'#b9a5ff'}}>YOUR FIRST QUEST · PREVIEW</div><strong style={{display:'block',marginTop:8,color:'#f4efff',fontSize:17}}>Read for 10 minutes</strong><p style={{margin:'5px 0 0',fontSize:12,color:'#b9b4cc',lineHeight:1.6}}>Choose a small goal, complete it at your pace, then log it to earn XP. This is an example—not a task assigned to you.</p></div>}<form onSubmit={submitAuth} style={{ display: 'grid', gap: 12 }}><label style={label}>EMAIL<input style={field} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label style={label}>PASSWORD<input style={field} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><button style={primary} disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button></form>{mode==='signin'&&<button type="button" style={linkButton} disabled={busy} onClick={()=>void requestPasswordReset()}>Forgot your password?</button>}{message&&<p style={success}>{message}</p>}{error&&<p style={danger}>{error}</p>}<button style={linkButton} onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('');setMessage('');}}>{mode==='signin'?'New to PLAYFORGE? Create an account':'Already have an account? Sign in'}</button><button type="button" style={linkButton} disabled={busy} onClick={()=>{setShowIntro(true);setError('');setMessage('');}}>← Back to PLAYFORGE overview</button><small style={{color:'#9294a7'}}>Your data is private to your account. Never share your password.</small></div></div>;

  if (syncState === 'error' && !hydratedUser) return <div style={screen}><div style={panel}><Brand/><h1>Could not load cloud save</h1><p>{error}</p><button style={primary} onClick={()=>void hydrate(session)}>Retry</button><button style={linkButton} onClick={()=>void signOut()}>Sign out</button></div></div>;

  if (legacyData !== null) return <div style={screen}><div style={panel}><Brand/><div style={eyebrow}>FIRST-TIME CLOUD SETUP</div><h1>Bring your existing progress?</h1><p>We found a save in this browser. Import it into this account, or start fresh. The import is a one-time copy; it will not overwrite another account.</p><button style={primary} disabled={busy} onClick={()=>void chooseLegacy(true)}>Import this browser's progress</button><button style={secondary} disabled={busy} onClick={()=>void chooseLegacy(false)}>Start with a fresh profile</button>{error&&<p style={danger}>{error}</p>}</div></div>;

  return <><div style={accountBar}><span><i style={{...dot,background:syncState==='error'?'#fb7185':syncState==='syncing'?'#fbbf24':'#4ade80'}}/> {syncState==='syncing'?'Syncing…':syncState==='error'?'Sync issue':'Cloud synced'} · {session.user.email}</span><button style={signOutButton} onClick={()=>void signOut()}>Sign out</button></div>{error&&<div style={errorBar}>Cloud sync needs attention: {error}</div>}<App/></>;
}

function Brand(){return <div style={{fontSize:13,fontWeight:900,letterSpacing:'.24em',color:'#b9a5ff',marginBottom:24}}>PLAYFORGE <span style={{color:'#77758e'}}>/ PLAYER ID</span></div>}
const screen: React.CSSProperties = {minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'radial-gradient(ellipse at 50% 0%,#21163f 0%,#0b0a13 55%)',color:'#f7f5ff',fontFamily:'Inter,system-ui,sans-serif'};
const panel: React.CSSProperties = {width:'min(100%,440px)',padding:32,border:'1px solid #38314e',borderRadius:24,background:'rgba(19,17,29,.96)',boxShadow:'0 24px 90px #0008',display:'grid',gap:16};
const eyebrow: React.CSSProperties = {fontSize:10,letterSpacing:'.2em',color:'#a78bfa',fontWeight:800};
const label: React.CSSProperties = {display:'grid',gap:8,fontSize:10,letterSpacing:'.15em',color:'#aaa5bd',fontWeight:800};
const field: React.CSSProperties = {width:'100%',boxSizing:'border-box',padding:'14px 15px',border:'1px solid #49415f',borderRadius:12,background:'#100e19',color:'#fff',fontSize:15,outline:'none'};
const primary: React.CSSProperties = {padding:14,border:0,borderRadius:12,background:'linear-gradient(100deg,#8b5cf6,#6d48d8)',color:'#fff',fontWeight:800,cursor:'pointer'};
const secondary: React.CSSProperties = {...primary,background:'#242032',border:'1px solid #49415f'};
const linkButton: React.CSSProperties = {border:0,background:'transparent',color:'#c4b5fd',padding:8,cursor:'pointer'};
const success: React.CSSProperties = {color:'#86efac',fontSize:13};
const danger: React.CSSProperties = {color:'#fda4af',fontSize:13,overflowWrap:'anywhere'};
const accountBar: React.CSSProperties = {position:'sticky',top:0,zIndex:1000,display:'flex',justifyContent:'flex-end',alignItems:'center',gap:16,padding:'9px 20px',background:'#100d1beF',borderBottom:'1px solid #342b49',color:'#c7c2d7',fontSize:12};
const signOutButton: React.CSSProperties = {border:'1px solid #55466e',borderRadius:8,padding:'6px 10px',background:'#211a30',color:'#eee7ff',cursor:'pointer'};
const errorBar: React.CSSProperties = {padding:8,textAlign:'center',background:'#4c1d2b',color:'#fecdd3',fontSize:12};
const dot: React.CSSProperties = {display:'inline-block',width:7,height:7,borderRadius:'50%',marginRight:6};
export default function MultiUserApp(){ return <AuthShell/>; }
