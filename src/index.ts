enum STATUS {
  'pending',
  'fulfilled',
  'rejected'
}
type Resolve = (value: any) => any
type Reject = (reason: any) => any
type Exector = (resolve: Resolve, reject: Reject) => void
type ResolvePromise = (promise2: MyPromise, x: any, resolve: Resolve, reject: Reject) => void

class MyPromise {
  static deferred: Function
  private value: any
  private reason: any
  private status: STATUS
  private onFulfilledCallbacks: Resolve[]
  private onRejectCallbacks: Reject[]
  private resolve: Resolve
  private reject: Reject
  private resolvePromise: ResolvePromise
  constructor (exector: Exector) {
    this.value = null
    this.reason = null
    this.status = STATUS.pending
    this.onFulfilledCallbacks = []
    this.onRejectCallbacks = []
    this.resolve = (value: any) => {
      if (this.status === STATUS.pending) {
        setTimeout(() => {
          this.value = value
          this.status = STATUS.fulfilled
          this.onFulfilledCallbacks.forEach(onFulfilled => onFulfilled(this.value))
        })
      }
    }
    this.reject = (reason: any) => {
      if (this.status === STATUS.pending) {
        setTimeout(() => {
          this.reason = reason
          this.status = STATUS.rejected
          this.onRejectCallbacks.forEach(onReject => onReject(this.reason))
        })
      }
    }
    this.resolvePromise = (promise2, x, resolve, reject) => {
      if (x === promise2) {
        return reject(new TypeError('不能返回相同的引用'))
      }
      if (x instanceof MyPromise) {
        x.then(resolve, reject)
      } else if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        let called = false
        try {
          const then = x.then
          if (typeof then === 'function') {
            then.call(x, (y: any) => {
              if (called) {
                return
              }
              called = true
              this.resolvePromise(promise2, y, resolve, reject)
            }, (r: any) => {
              if (called) {
                return
              }
              called = true
              reject(r)
            })
          } else {
            if (called) {
              return
            }
            called = true
            resolve(x)
          }
        } catch (e) {
          if (called) {
            return
          }
          called = true
          reject(e)
        }
      } else {
        resolve(x)
      }
    }
    exector(this.resolve, this.reject)
  }
  then (onFulfilled?: Resolve, onReject?: Reject) {
    onFulfilled = onFulfilled && typeof onFulfilled === 'function' ? onFulfilled : (value: any) => value
    onReject = onReject && typeof onReject === 'function' ? onReject : (reason: any) => { throw reason }

    const promise2 = new MyPromise((resolve, reject) => {
      try {
        if (this.status === STATUS.fulfilled) {
          setTimeout(() => {
            const x = onFulfilled?.(this.value)
            this.resolvePromise(promise2, x, resolve, reject)
          })
        }
        if (this.status === STATUS.rejected) {
          setTimeout(() => {
            const x = onReject?.(this.reason)
            this.resolvePromise(promise2, x, resolve, reject)
          })
        }
        if (this.status == STATUS.pending) {
          this.onFulfilledCallbacks.push(() => {
            setTimeout(() => {
              try {
                const x = onFulfilled?.(this.value)
                this.resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            })
          })
          this.onRejectCallbacks.push(() => {
            setTimeout(() => {
              try {
                const x = onReject?.(this.reason)
                this.resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            })
          })
        }
      } catch (e) {
        reject(e)
      }
    })
    return promise2
  }
}

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  })
}).then(value => {
  console.log('ok: ', value)
  return new MyPromise((resolve) => {
    resolve('哈哈哈')
  })
}, reason => {
  console.log('error: ', reason)
  return `${reason} --- fail`
})

p.then(value => {
  console.log('ok 2: ', value)
}, reason => {
  console.log('error 2: ', reason)
})

MyPromise.deferred = function () {
  const dfd: any = {}
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}