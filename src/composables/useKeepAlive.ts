import { supabase } from '@/utils/supabase'

const PING_INTERVAL = 24 * 60 * 60 * 1000

let pingTimer: ReturnType<typeof setInterval> | null = null

export function useKeepAlive() {
  const ping = async () => {
    try {
      await supabase.from('user_backups').select('id').limit(1).maybeSingle()
      console.log('[KeepAlive] Supabase ping successful')
    } catch {
      // silently ignore
    }
  }

  const start = () => {
    ping()
    pingTimer = setInterval(ping, PING_INTERVAL)
  }

  const stop = () => {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  return { start, stop }
}