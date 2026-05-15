const test = require('tape')
const { XorShift128Plus } = require('xorshift.js')

const seed = '27f098d21ca458d4033e3ea269db8b27'
const prng = new XorShift128Plus(seed)

module.exports = (bindings, purejs) => {
  const hashes = [
    'blake224',
    'blake256',
    'blake384',
    'blake512'
  ]

  const getHash = (engine, name, bytes) => engine(name).update(bytes).digest('hex')

  for (const hash of hashes) {
    test(`random tests: ${hash}`, (t) => {
      for (let i = 0; i < 25; ++i) {
        let size = prng.randomInt64()[1] % 32768 // not more than 32KiB
        if (i === 0) size = 55 // special case

        const bytes = prng.randomBytes(size)
        t.equal(getHash(bindings, hash, bytes), getHash(purejs, hash, bytes))
      }

      t.end()
    })
  }
}
