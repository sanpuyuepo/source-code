/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // target: 静态属性, Watcher类型
  static target: ?Watcher;
  // Dep 实例ID
  id: number;
  // Dep 实例对应的 watcher 对象数组
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }
  // 添加新的 subscriber: watcher 对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  // 移除订阅者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 将观察对象和 watcher 建立依赖
  depend () {
    if (Dep.target) {
      // 如果 target 存在, 把 dep 对象添加到 watcher 的依赖中
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 调用每个订阅者的update方法实现更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 用来存放目前正在使用的watcher
// 全局唯一且一次只能有一个watcher被使用
Dep.target = null
const targetStack = []
// 入栈并将当前 watcher 赋值给 Dep.target
// 当存在父子组件嵌套的情况时, 先把父组件对应的 watcher 入栈
// 再去处理子组件的 watcher, 子组件的处理完毕后, 再把父组件对应的 watcher 出栈, 继续操作
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  // 出栈
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
