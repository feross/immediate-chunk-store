const abstractTests = require('abstract-chunk-store/tests')
const ImmediateChunkStore = require('../')
const FSChunkStore = require('fs-chunk-store')
const MemoryChunkStore = require('memory-chunk-store')
const test = require('tape')

abstractTests(test, chunkLength => {
  return new ImmediateChunkStore(new MemoryChunkStore(chunkLength))
})

abstractTests(test, chunkLength => {
  return new ImmediateChunkStore(new FSChunkStore(chunkLength))
})

test('put then immediate get', t => {
  const store = new ImmediateChunkStore(new FSChunkStore(10))

  store.put(0, Buffer.from('0123456789'), onPut)

  // And now, get the same chunk out BEFORE the put is complete
  store.get(0, (err, data) => {
    t.error(err)
    t.deepEqual(data, Buffer.from('0123456789'))
    didGet1 = true
    maybeDone()
  })

  function onPut (err) {
    t.error(err)

    // Getting after put should still work
    store.get(0, (err, data) => {
      t.error(err)
      t.deepEqual(data, Buffer.from('0123456789'))
      didGet2 = true
      maybeDone()
    })
  }

  let didGet1 = false
  let didGet2 = false
  function maybeDone () {
    if (didGet1 && didGet2) {
      store.destroy(err => {
        t.error(err)
        t.end()
      })
    }
  }
})
