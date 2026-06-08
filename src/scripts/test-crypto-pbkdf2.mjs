import crypto from 'node:crypto'

const password = 'test'
const salt = crypto.randomBytes(32).toString('hex')

console.log('sync randomBytes ok')

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('pbkdf2 callback timeout')), 5000)
  crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, hash) => {
    clearTimeout(timeout)
    if (err) reject(err)
    else resolve(hash)
  })
}).then((hash) => {
  console.log('callback pbkdf2 ok', hash.length)
})

const hash2 = await crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256')
console.log('sync pbkdf2 ok', hash2.length)
