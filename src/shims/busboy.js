/** CJS multipart parser — stubbed for dev client; uploads run on the server only. */
export default function busboy() {
  const stream = {
    on() {
      return stream
    },
    write() {},
    end() {},
    destroy() {},
  }

  return stream
}
