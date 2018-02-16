const test = require('tape');
const fromIter = require('callbag-basics').fromIter;
const toAwaitable = require('./readme');

test('it converts a sync pullable source to awaitable', async function (t) {
  t.plan(10);
  const upwardsExpected = [
    [0, 'function'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let _sink;
    let sent = 0;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.deepEquals([type, typeof data], e, 'upwards is expected: ' + e);

      if (type === 0) {
        _sink = data;
        _sink(0, source);
        return;
      }
      if (sent === 3) {
        _sink(2);
        return;
      }
      if (sent === 0) {
        sent++;
        _sink(1, 10);
        return;
      }
      if (sent === 1) {
        sent++;
        _sink(1, 20);
        return;
      }
      if (sent === 2) {
        sent++;
        _sink(1, 30);
        return;
      }
    };
    return source;
  }

  const source = makeSource();
  const next = toAwaitable(source);

  try {
    while (true) {
      const x = await next;
      const e = downwardsExpected.shift();
      t.equals(x, e, 'downwards is expected: ' + e);
    }
  } catch (end) {
    t.pass('try-catch is called');
  }

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 300);
});

test('it converts an async pullable source to awaitable', async function (t) {
  t.plan(10);
  const upwardsExpected = [
    [0, 'function'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let _sink;
    let sent = 0;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.deepEquals([type, typeof data], e, 'upwards is expected: ' + e);

      if (type === 0) {
        _sink = data;
        _sink(0, source);
        return;
      }
      if (sent === 0) {
        sent++;
        setTimeout(() => _sink(1, 10), 100);
        return;
      }
      if (sent === 1) {
        sent++;
        setTimeout(() => _sink(1, 20), 100);
        return;
      }
      if (sent === 2) {
        sent++;
        setTimeout(() => _sink(1, 30), 100);
        return;
      }
      if (sent === 3) {
        sent++;
        setTimeout(() => _sink(2), 100);
        return;
      }
    };
    return source;
  }

  const source = makeSource();
  const next = toAwaitable(source);

  try {
    while (true) {
      const x = await next;
      const e = downwardsExpected.shift();
      t.equals(x, e, 'downwards is expected: ' + e);
    }
  } catch (end) {
    t.pass('try-catch is called');
  }

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});

