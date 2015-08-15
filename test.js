var abstractTests = require('abstract-chunk-store/tests')
var ImmediateChunkStore = require('./')
var FSChunkStore = require('fs-chunk-store')
var MemoryChunkStore = require('memory-chunk-store')
var test = require('tape')

abstractTests(test, function (chunkLength) {
  return new ImmediateChunkStore(new MemoryChunkStore(chunkLength))
})

abstractTests(test, function (chunkLength) {
  return new ImmediateChunkStore(new FSChunkStore(chunkLength))
})

test('put then immediate get', function (t) {
  t.plan(5)
  var store = new ImmediateChunkStore(new FSChunkStore(10))

  store.put(0, new Buffer('0123456789'), onPut)

  // And now, get the same chunk out BEFORE the put is complete
  store.get(0, function (err, data) {
    t.error(err)
    t.deepEqual(data, new Buffer('0123456789'))
  })

  function onPut (err) {
    t.error(err)

    // Getting after put should still work
    store.get(0, function (err, data) {
      t.error(err)
      t.deepEqual(data, new Buffer('0123456789'))
    })
  }
})
