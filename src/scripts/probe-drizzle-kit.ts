import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config, disableDBConnect: true, disableOnInit: true })
  const kit = (
    payload.db as { requireDrizzleKit: () => Record<string, unknown> }
  ).requireDrizzleKit()
  console.log(Object.keys(kit))
}

main().catch(console.error)
