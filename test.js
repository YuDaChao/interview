const fs = require('fs')

fs.readFile('./data.txt', 'utf-8', function (err, data) {
  console.log(data)
})

const promiseify = function (fn) {
  return function () {
    return new Promise((resolve, reject) => {
      fn(...arguments, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}

const thunkify = function (fn) {
  return function (...args) {
    return function (cb) {
      fn(...args, cb)
    }
  }
}

const thunk = thunkify(fs.readFile)

const readFileThunk = thunk('./data.txt', 'utf-8')

// readFileThunk(function (err, data) {
//   console.log(data)
// })

const readFilePromise = promiseify(fs.readFile)('./data.txt', 'utf-8')
readFilePromise.then((value) => {
  console.log('success: ', value)
}, (reason) => {
  console.log('error: ', reason)
})

function* readFileThunkWitnGen () {
  const content1 = yield readFileThunk
  console.log('content1: ', content1)
  const content2 = yield readFileThunk
  console.log('content2: ', content2)
  return 'done'
}

// const iter = readFileThunkWitnGen()

// iter.next().value((err, data) => {
//   iter.next(data.toString()).value((err, data) => {
//     iter.next(data.toString())
//   })
// })

const run  = generator => {
  const g = generator()
  const next = (err, data) => {
    const result = g.next(data)
    console.log('data: ', data)
    if (result.done) {
      return result.value
    }
    result.value(next)
  }
  next()
}

run(readFileThunkWitnGen)