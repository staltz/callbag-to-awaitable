/**
 * callbag-to-awaitable
 * --------------------
 *
 * Use the `async`/`await` syntax with pullable Callbags! There are actually no
 * Promises in this package, just async-await syntax on objects with a `then`
 * method.
 *
 * `npm install callbag-to-awaitable`
 *
 * Example: on an async pullable callbag source, apply some operators, then
 * convert to an awaitable and consume it in an `async`/`await` function:
 *
 *     const {forEach, take, map, pipe} = require('callbag-basics');
 *     const toAwaitable = require('callbag-to-awaitable');
 *
 *     function pullableAsyncSource(start, sink) {
 *       if (start !== 0) return;
 *       let i = 0;
 *       sink(0, t => {
 *         if (t === 1) {
 *           setTimeout(() => { sink(1, i++) }, 1000);
 *         }
 *       });
 *     }
 *
 *     const source = pipe(
 *       pullableAsyncSource, // 0, 1, 2, 3, 4, 5, 6, 7...
 *       take(5), // 0, 1, 2, 3, 4
 *       map(x => x / 4) // 0, 0.25, 0.5, 0.75, 1
 *     );
 *
 *     async function main() {
 *       const next = toAwaitable(source);
 *       try {
 *         while (true) {
 *           const x = await next;
 *           console.log(x);
 *         }
 *       } catch (end) {
 *         console.log('done');
 *       }
 *     }
 *
 *     main()
 *     // 0
 *     // 0.25
 *     // 0.5
 *     // 0.75
 *     // 1
 *     // done
 *
 * For more inquiries, read or fork the source below:
 */

function toAwaitable(source) {
  let talkback;
  let resolve;
  let reject;
  let reason = false;
  source(0, (t, d) => {
    if (t === 0) talkback = d;
    if (t === 1 && resolve) resolve(d);
    if (t === 2) {
      reason = d || true;
      if (reject) reject(reason);
    }
    resolve = void 0;
    reject = void 0;
  });
  return {
    then: (_resolve, _reject) => {
      if (reason) _reject(reason);
      resolve = _resolve;
      reject = _reject;
      if (talkback) talkback(1);
    },
  };
}

module.exports = toAwaitable;
