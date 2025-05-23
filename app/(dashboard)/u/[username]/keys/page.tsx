
import UrlCard from './_components/url-card'
import { getSelf } from '@/lib/auth-service'
import { getStreamByUserId } from '@/lib/stream-service'
import { KeyCard } from './_components/key-card'
import {ConnectModal} from './_components/connectmodel'

const Keyspage = async () => {
  const self = await getSelf()

  if (!self) {
    throw new Error("User not authenticated or not found");
  }

  const stream = await getStreamByUserId(self.id)

  if (!stream) {
    throw new Error('Stream not found')
  }
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys & URLs</h1>
       <ConnectModal/>
      </div>
      <div className="space-y-4">
        <UrlCard value={stream.serverUrl} />
        <KeyCard value={stream.streamKey} />
      </div>
    </div>
  )
}

export default Keyspage