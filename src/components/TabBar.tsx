import { useDemo, type TabId } from '../demo/store'

const TABS: { id: TabId; label: string }[] = [
  { id: 'watch', label: 'Watch' },
  { id: 'adopt', label: 'Adopt' },
  { id: 'leagues', label: 'Leagues' },
  { id: 'feed', label: 'Feed' },
]

export default function TabBar() {
  const { state, dispatch, owned } = useDemo()
  const asleep = owned.some((d) => d.state === 'asleep')

  return (
    <nav
      className="flex shrink-0 border-t px-2 pt-2 pb-3"
      style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper)' }}
    >
      {TABS.map((tab) => {
        const active = state.tab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => dispatch({ type: 'set-tab', tab: tab.id })}
            className="relative flex-1 py-1.5 text-center text-[13px]"
            style={{ color: active ? 'var(--color-ink)' : 'var(--color-muted)' }}
          >
            {tab.label}
            {tab.id === 'watch' && asleep && (
              <span
                className="anim-breathe absolute top-0 right-[22%] block h-[5px] w-[5px] rounded-full"
                style={{ background: 'var(--color-amber)' }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
