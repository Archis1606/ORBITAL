import { isSupabaseConfigured } from '@/lib/supabase'
import { Database, ShieldCheck } from 'lucide-react'

export function BackendNotice() {
  const configured = isSupabaseConfigured()

  if (configured) {
    return (
      <aside className="glass-panel rounded-2xl border border-mint/40 px-5 py-4 bg-mint/5">
        <div className="flex items-center gap-2 text-mint font-mono text-[0.65rem] tracking-[0.2em] uppercase">
          <ShieldCheck size={14} />
          <span>Supabase Production Backend Connected</span>
        </div>
        <p className="mt-2 font-medium text-sm text-ivory">Real Database & Storage Active</p>
        <p className="mt-1 text-xs text-muted">
          Row-Level Security (RLS) is enforcing user data ownership, private drafts, and storage bucket quotas.
        </p>
      </aside>
    )
  }

  return (
    <aside className="glass-panel rounded-2xl border border-cyan/40 px-5 py-4 bg-navy/60">
      <div className="flex items-center gap-2 text-cyan font-mono text-[0.65rem] tracking-[0.2em] uppercase">
        <Database size={14} />
        <span>Local Offline Preview Mode</span>
      </div>
      <p className="mt-2 font-medium text-sm text-ivory">Supabase Credentials Not Yet Configured</p>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        ORBITAL is using browser-only demo data. Configure the Supabase URL and public anon key locally or in Vercel to enable permanent accounts, profiles, follows, and photo uploads.
      </p>
    </aside>
  )
}
