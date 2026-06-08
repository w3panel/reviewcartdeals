export default {
  async fetch() {
    const logs = []
    try {
      const crypto = await import('node:crypto')
      const password = 'testpassword123'
      const saltBuffer = crypto.randomBytes(32)
      const salt = saltBuffer.toString('hex')

      const start = Date.now()
      await new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 25e3, 512, 'sha256', (err, hashBuffer) => {
          if (err) reject(err)
          else resolve(hashBuffer)
        })
      })
      logs.push(`payload-style pbkdf2 ok in ${Date.now() - start}ms`)

      const start2 = Date.now()
      crypto.pbkdf2Sync(password, salt, 25e3, 512, 'sha256')
      logs.push(`payload-style pbkdf2Sync ok in ${Date.now() - start2}ms`)
    } catch (e) {
      logs.push(`error: ${e instanceof Error ? e.message : String(e)}`)
    }
    return new Response(logs.join('\n'))
  },
}
