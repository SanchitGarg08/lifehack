import { useDemo } from '../demo/store'

export default function Notice() {
  const { state, dispatch } = useDemo()
  const notice = state.notice
  if (!notice) return null
  const warm = notice.tone === 'standby'

  return (
    <div
      role="status"
      className="anim-rise mx-5 mb-3 shrink-0 rounded-[13px] px-4 py-3.5"
      style={{ background: warm ? 'var(--color-amber-soft)' : 'var(--color-faint)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="u-serif text-[16px] leading-snug"
            style={{ color: warm ? 'var(--color-amber)' : 'var(--color-ink)' }}
          >
            {notice.title}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--color-muted)' }}>
            {notice.body}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'dismiss-notice' })}
          className="shrink-0 text-[12px]"
          style={{ color: 'var(--color-muted)' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
