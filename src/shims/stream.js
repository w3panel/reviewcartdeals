/** Browser-safe stub for Node stream (Payload upload utilities). */
export class Readable {
  on() {
    return this
  }

  pipe() {
    return this
  }

  static from() {
    return new Readable()
  }
}

export default { Readable }
