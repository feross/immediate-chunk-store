class ImmediateStore {
  constructor (store) {
    this.store = store
    this.chunkLength = store.chunkLength

    if (!this.store || !this.store.get || !this.store.put) {
      throw new Error('First argument must be abstract-chunk-store compliant')
    }

    this.mem = []
  }

  put (index, buf, cb) {
    this.mem[index] = buf
    this.store.put(index, buf, err => {
      this.mem[index] = null
      if (cb) cb(err)
    })
  }

  get (index, opts, cb) {
    if (typeof opts === 'function') return this.get(index, null, opts)

    const start = (opts && opts.offset) || 0
    const end = opts && opts.length && (start + opts.length)

    const buf = this.mem[index]
    if (buf) return nextTick(cb, null, opts ? buf.slice(start, end) : buf)

    this.store.get(index, opts, cb)
  }

  close (cb) {
    this.store.close(cb)
  }

  destroy (cb) {
    this.store.destroy(cb)
  }
}

function nextTick (cb, err, val) {
  process.nextTick(() => {
    if (cb) cb(err, val)
  })
}

module.exports = ImmediateStore
