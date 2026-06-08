/** Browser-safe stub for Node fs. */
import * as promises from './promises.js'

const noop = () => {}

export class WriteStream {
  on() {
    return this
  }
  write() {}
  end() {}
}

export class ReadStream {
  on() {
    return this
  }
  pipe() {
    return this
  }
}

export const createWriteStream = () => new WriteStream()
export const createReadStream = () => new ReadStream()

export const existsSync = () => false
export const readFileSync = () => ''
export const writeFileSync = noop
export const mkdirSync = noop
export const unlinkSync = noop
export const rmSync = noop
export const readdirSync = () => []
export const statSync = () => ({
  isFile: () => false,
  isDirectory: () => false,
  size: 0,
})
export const lstatSync = statSync
export const realpathSync = (p) => p
export const accessSync = noop
export const copyFileSync = noop
export const appendFileSync = noop

export { promises }

const fs = {
  promises,
  WriteStream,
  ReadStream,
  createWriteStream,
  createReadStream,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
  rmSync,
  readdirSync,
  statSync,
  lstatSync,
  realpathSync,
  accessSync,
  copyFileSync,
  appendFileSync,
}

export default fs
