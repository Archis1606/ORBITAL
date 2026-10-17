import { supabaseNotice } from '@/data/site'

export function BackendNotice() {
  return (
    <aside className="glass-panel rounded-2xl px-5 py-4">
      <p className="font-mono text-[0.65rem] tracking-[0.2em] text-cyan uppercase">Integration pending</p>
      <p className="mt-2 font-medium">{supabaseNotice.title}</p>
      <p className="mt-1 text-sm text-muted">{supabaseNotice.body}</p>
    </aside>
  )
}
