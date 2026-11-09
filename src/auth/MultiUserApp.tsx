import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import App from '../App';

const STORAGE_KEY = 'playforge.v1';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

type SyncState = 'loading' | 'ready' | 'syncing' | 'error';
function AuthShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
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

  if (!session) return <div style={screen}><div style={panel}><Brand/><div style={eyebrow}>YOUR PROGRESS. YOUR ACCOUNT.</div><h1>{mode === 'signin' ? 'Welcome back, player.' : 'Create your player account.'}</h1><p>Sign in on any laptop to continue with the same quests, XP and progress.</p><form onSubmit={submitAuth} style={{ display: 'grid', gap: 12 }}><label style={label}>EMAIL<input style={field} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label style={label}>PASSWORD<input style={field} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><button style={primary} disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button></form>{mode==='signin'&&<button type="button" style={linkButton} disabled={busy} onClick={()=>void requestPasswordReset()}>Forgot your password?</button>}{message&&<p style={success}>{message}</p>{error&&<p style={danger}>{error}</p>}<button style={linkButton} onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('');setMessage('');}}>{mode==='signin'?'New to PLAYFORGE? Create an account':'Already have an account? Sign in'}</button><small style={{color:'#9294a7'}}>Your data is private to your account. Never share your password.</small></div></div>;

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
