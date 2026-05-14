const test = require('tape')
const bindings = require('../bindings')
const purejs = require('../js')

function main (name, createHash) {
  require('./vectors')(name, createHash)
  require('./api')(name, createHash)

  test(`${name} invalid algorithm`, (t) => {
    t.throws(() => createHash(null), /^Error: Invald algorithm: null$/)
    t.end()
  })
}

main('bindings', bindings)
main('pure js', purejs)

require('./random')(bindings, purejs)

/*
function puint32 (v) {
  const x = Buffer.alloc(4)
  x.writeUInt32BE(v)
  process.stdout.write(x.toString('hex').toUpperCase())
}
function pv () {
  for (let j = 0; j < v.length; ++j) {
    puint32(v[j])
    if (v.length === 16 || j % 2 === 1) process.stdout.write('  ')
    if ((j + 1) % 8 === 0) process.stdout.write('\n')
  }
  process.stdout.write('\n\n')
}
*/
