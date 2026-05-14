const test = require('tape')
const Buffer = require('buffer').Buffer

const utf8text = 'УТФ-8 text'

module.exports = (name, createHash) => {
  test(`${name} Blake#_transform`, (t) => {
    t.test('should use Blake#update', (t) => {
      const hash = createHash('blake256')

      t.plan(3)
      hash.update = (data, enc) => {
        t.same(data, utf8text)
        t.same(enc, 'utf8')
      }
      hash._transform(utf8text, 'utf8', (err) => t.same(err, null))
      t.end()
    })

    t.test('should handle error in Blake#update', (t) => {
      const hash = createHash('blake256')
      const err = new Error('42')

      t.plan(1)
      hash.update = () => { throw err }
      hash._transform(Buffer.alloc(0), 'buffer', (_err) => t.true(_err === err))
      t.end()
    })

    t.end()
  })

  test(`${name} Blake#_flush`, (t) => {
    t.test('should use Blake#digest', (t) => {
      const hash = createHash('blake256')
      const buffer = Buffer.alloc(0)

      t.plan(2)
      hash.push = (data) => t.true(data === buffer)
      hash.digest = () => buffer
      hash._flush((err) => t.same(err, null))
      t.end()
    })

    t.test('should handle errors in Blake#digest', (t) => {
      const hash = createHash('blake256')
      const err = new Error('42')

      t.plan(1)
      hash.digest = () => { throw err }
      hash._flush((_err) => t.true(_err === err))
      t.end()
    })

    t.end()
  })

  test(`${name} Blake#update`, (t) => {
    t.test('only string or buffer is allowed', (t) => {
      const hash = createHash('blake256')

      t.throws(() => hash.update(null), /^TypeError: Data must be a string or a buffer$/)
      t.end()
    })

    t.test('should throw error after Blake#digest', (t) => {
      const hash = createHash('blake256')

      hash.digest()
      t.throws(() => hash.update(''), /^Error: Digest already called$/)
      t.end()
    })

    t.test('should return `this`', (t) => {
      const hash = createHash('blake256')

      t.same(hash.update(Buffer.alloc(0)), hash)
      t.end()
    })

    t.end()
  })

  test(`${name} Blake#digest`, (t) => {
    t.test('should throw error on second call', (t) => {
      const hash = createHash('blake256')

      hash.digest()
      t.throws(() => hash.digest(), /^Error: Digest already called$/)
      t.end()
    })

    t.test('should return buffer by default', (t) => {
      const hash = createHash('blake256')

      t.true(Buffer.isBuffer(hash.digest()))
      t.end()
    })

    t.test('should encode result with custom encoding', (t) => {
      const hash = createHash('blake256')

      const digest = hash.digest('hex')
      t.equal(typeof digest, 'string')
      t.equal(digest.length, 64)
      t.end()
    })

    t.end()
  })
}
