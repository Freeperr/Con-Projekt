import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../api/contact.js', import.meta.url), 'utf8');
const { default: handler } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('contact handler validates, sends and redacts errors without real email', async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.error;
  const saved = Object.fromEntries(['RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_TO'].map(k => [k, process.env[k]]));
  const logs = [];
  const sent = [];
  const invoke = async (body, method = 'POST') => {
    const result = { headers: {} };
    const res = {
      setHeader(k, v) { result.headers[k] = v; },
      status(n) { result.status = n; return this; },
      json(v) { result.body = v; return this; },
    };
    await handler({ method, body, headers: { 'x-forwarded-for': '192.0.2.1' } }, res);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    return result;
  };
  try {
    process.env.RESEND_API_KEY = 'unit-test';
    process.env.CONTACT_FROM = 'form@example.invalid';
    process.env.CONTACT_TO = 'recipient@example.invalid';
    console.error = (...args) => logs.push(args.join(' '));
    globalThis.fetch = async (url, options) => { sent.push({url, ...options}); return {ok:true}; };
    const get = await invoke({}, 'GET');
    assert.equal(get.status, 405); assert.equal(get.headers.Allow, 'POST');
    for (const body of [null, [], {}, {name: {}, email:'a@b.de'}, {name:' ',email:'a@b.de'},
      {name:'a',email:'invalid'}, {name:'a',email:'a@b.de\nBcc:x@y.de'},
      {name:'a\nBcc',email:'a@b.de'}, {name:'x'.repeat(201),email:'a@b.de'},
      {name:'a',email:'a@b.de',objekt:{}}, {name:'a',email:'a@b.de',objekt:'x'.repeat(10001)}]) {
      assert.equal((await invoke(body)).status,400);
    }
    assert.equal(sent.length,0);
    const body = {name:' <Test> ', email:' test@example.invalid ', objekt:'<script>bad</script>\nText'};
    assert.equal((await invoke(body)).status,200);
    const email = JSON.parse(sent[0].body);
    assert.equal(sent[0].url,'https://api.resend.com/emails');
    assert.equal(email.reply_to,'test@example.invalid');
    assert.deepEqual(email.to,['recipient@example.invalid']);
    assert.match(email.html,/&lt;Test&gt;/); assert.match(email.html,/&lt;script&gt;/);
    assert.ok(!sent[0].body.includes('192.0.2.1')); assert.ok(sent[0].signal instanceof AbortSignal);
    delete process.env.RESEND_API_KEY;
    assert.equal((await invoke(body)).status,500);
    process.env.RESEND_API_KEY='unit-test';
    delete process.env.CONTACT_FROM;
    assert.equal((await invoke(body)).status,500);
    process.env.CONTACT_FROM='form@example.invalid';
    globalThis.fetch = async () => ({ok:false,status:429,text:async()=>{throw Error('Must not read provider details');}});
    assert.equal((await invoke(body)).status,502);
    globalThis.fetch = async () => { throw Error('PRIVATE MESSAGE CONTENT'); };
    assert.equal((await invoke(body)).status,500);
    assert.ok(!logs.join(' ').includes('PRIVATE MESSAGE CONTENT'));
    assert.ok(!logs.join(' ').includes('test@example.invalid'));
  } finally {
    globalThis.fetch=originalFetch; console.error=originalLog;
    for (const [key,value] of Object.entries(saved)) {
      if(value === undefined) delete process.env[key]; else process.env[key]=value;
    }
  }
});
