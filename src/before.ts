/**
 * before方法实现思路
 * 在调用目标方法之前先调用自己的方法
 */

// 声明全局环境下的属性
declare global {
  interface Function { // 方法合并
    before(cb: () => void): (...args: any) => void
  }
}

Function.prototype.before = function (cb: () => void) {
  return (...args: any) => {
    cb()
    this(...args)
  }
}

// 目标方法
function core(...args: any) {
  console.log('core: ', ...args)
}

function study() {
  console.log('调用之前先学习会儿')
}

const resultFn = core.before(study)
resultFn('jack')

export {}