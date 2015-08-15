module.exports = ImmediateStore

function ImmediateStore (store) {
  if (!(this instanceof ImmediateStore)) return new ImmediateStore(store)

  this.store = store
  if (!this.store) throw new Error('First argument must be a chunk length')

  this.mem = []
  this.closed = false
}

ImmediateStore.prototype.put = function (index, buf, cb) {
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))
  var self = this
  self.mem[index] = buf
  self.store.put(index, buf, function (err) {
    self.mem[index] = null
    if (cb) cb(err)
  })
}

ImmediateStore.prototype.get = function (index, opts, cb) {
  if (typeof opts === 'function') return this.get(index, null, opts)
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))

  var start = (opts && opts.offset) || 0
  var end = opts && opts.length && (start + opts.length)

  var buf = this.mem[index]
  if (buf) return nextTick(cb, null, opts ? buf.slice(start, end) : buf)

  this.store.get(index, opts, cb)
}

ImmediateStore.prototype.close = function (cb) {
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))
  this.closed = true
  this.store.close(cb)
}

ImmediateStore.prototype.destroy = function (cb) {
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))
  this.closed = true
  this.store.destroy(cb)
}

function nextTick (cb, err, val) {
  process.nextTick(function () {
    if (cb) cb(err, val)
  })
}
