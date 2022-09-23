import type { AnitomyResult } from 'anitomyscript'

import anitomy from 'anitomyscript/dist/anitomyscript.bundle'

export const parseName = async () => {
  const anitomyResult: AnitomyResult = await anitomy('foo bar')
}
