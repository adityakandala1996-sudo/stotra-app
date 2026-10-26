// Auth + profile storage. Uses Supabase when configured, otherwise a local demo store.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY;

const PROFILE_FIELDS = ['full_name', 'full_name_te', 'language', 'country', 'city', 'gotra', 'deity', 'dvipa_override', 'favorites'];

function pick(obj) {
  return Object.fromEntries(PROFILE_FIELDS.filter((k) => k in obj).map((k) => [k, obj[k]]));
}

function supabaseBackend() {
  const sb = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return {
    async currentUser() {
      const { data } = await sb.auth.getSession();
      return data.session?.user ?? null;
    },
    async signUp(email, password, fullName) {
      // "Confirm email" must be OFF in Supabase Auth settings so a session is returned immediately.
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      if (!data.session) {
        const r = await sb.auth.signInWithPassword({ email, password });
        if (r.error) throw r.error;
        return r.data.user;
      }
      return data.user;
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async getProfile(user) {
      const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async saveProfile(user, profile) {
      const row = { id: user.id, ...pick(profile), updated_at: new Date().toISOString() };
      const { data, error } = await sb.from('profiles').upsert(row).select().single();
      if (error) throw error;
      return data;
    },
  };
}

function demoBackend() {
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
  return {
    async currentUser() {
      return read('demo.session', null);
    },
    async signUp(email, password, fullName) {
      const users = read('demo.users', {});
      if (users[email]) throw new Error('User already registered');
      users[email] = { id: crypto.randomUUID(), email, password, full_name: fullName };
      write('demo.users', users);
      return this.signIn(email, password);
    },
    async signIn(email, password) {
      const u = read('demo.users', {})[email];
      if (!u || u.password !== password) throw new Error('Invalid login credentials');
      const user = { id: u.id, email, user_metadata: { full_name: u.full_name } };
      write('demo.session', user);
      return user;
    },
    async signOut() {
      try { localStorage.removeItem('demo.session'); } catch { /* ignore */ }
    },
    async getProfile(user) {
      return read('demo.profiles', {})[user.id] ?? null;
    },
    async saveProfile(user, profile) {
      const all = read('demo.profiles', {});
      all[user.id] = { id: user.id, ...pick(profile) };
      write('demo.profiles', all);
      return all[user.id];
    },
  };
}

export const backend = DEMO ? demoBackend() : supabaseBackend();
