import DemoPanel from './components/DemoPanel'
import TabBar from './components/TabBar'
import TopBar from './components/TopBar'
import Notice from './components/Notice'
import AdoptTab from './tabs/AdoptTab'
import FeedTab from './tabs/FeedTab'
import LeaguesTab from './tabs/LeaguesTab'
import WatchTab from './tabs/WatchTab'
import DetailSheet from './components/DetailSheet'
import Moment from './components/Moment'
import { DemoProvider, useDemo, useDemoKeys } from './demo/store'

function Shell() {
  const { state, owned } = useDemo()
  useDemoKeys()
  const idling = owned.some((d) => d.state === 'asleep')

  return (
    <div className="shell flex flex-col" data-idle={idling}>
      <TopBar />
      <main className="scroll-y flex-1 pt-3">
        {state.tab === 'watch' && <WatchTab />}
        {state.tab === 'adopt' && <AdoptTab />}
        {state.tab === 'leagues' && <LeaguesTab />}
        {state.tab === 'feed' && <FeedTab />}
      </main>
      <DetailSheet />
      <Notice />
      <TabBar />
      <Moment />
    </div>
  )
}

function Frame() {
  const { state } = useDemo()
  return (
    <div data-op={state.panelOpen} className="frame">
      <Shell />
      <DemoPanel />
    </div>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <Frame />
    </DemoProvider>
  )
}
