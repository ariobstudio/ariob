const native = NativeModules?.NativeWebCryptoModule;

/* ---------- helpers ---------- */
const toAB = v => (v instanceof ArrayBuffer ? v : v.buffer);
const toU8 = v => (v instanceof Uint8Array ? v : new Uint8Array(v));
const maybePromise = x => (x instanceof Promise ? x : Promise.resolve(x));

/* ---------- subtle ---------- */
if (!globalThis.crypto) globalThis.crypto = {};
if (!globalThis.crypto.subtle) globalThis.crypto.subtle = {};

crypto.subtle.digest = (algo, data) => maybePromise(
  native.digest(typeof algo === 'string' ? { name: algo } : algo, toU8(toAB(data)))
).then(b => {
  if (b == null) throw new Error('digest failed');
  return toU8(b).buffer;
});

crypto.subtle.generateKey = (alg, ext, usages) => maybePromise(
  native.generateKey(alg, !!ext, Array.from(usages || []))
).then(r => {
  if (r == null) throw new Error('generateKey failed');
  return r;        // r is NSDictionary → JS object (JWK or {privateKey,publicKey})
});

crypto.subtle.importKey = (fmt, keyData, alg, ext, usages) => {
  const param = fmt === 'raw' ? toU8(toAB(keyData)) : keyData;
  return maybePromise(
    native.importKey(fmt, param, alg, !!ext, Array.from(usages || []))
  ).then(r => {
    if (r == null) throw new Error('importKey failed');
    return r;
  });
};

crypto.subtle.exportKey = (fmt, key) => maybePromise(
  native.exportKey(fmt, key)
).then(r => {
  if (r == null) throw new Error('exportKey failed');
  return fmt === 'raw' ? toU8(r).buffer : r;
});

crypto.subtle.sign = (alg, key, data) => maybePromise(
  native.sign(alg, key, toU8(toAB(data)))
).then(r => {
  if (r == null) throw new Error('sign failed');
  return toU8(r).buffer;
});

crypto.subtle.verify = (alg, key, sig, data) => maybePromise(
  native.verify(alg, key, toU8(toAB(sig)), toU8(toAB(data)))
).then(x => !!x);

crypto.subtle.encrypt = (alg, key, data) => maybePromise(
  native.encrypt(alg, key, toU8(toAB(data)))
).then(r => {
  if (r == null) throw new Error('encrypt failed');
  return toU8(r).buffer;
});

crypto.subtle.decrypt = (alg, key, data) => maybePromise(
  native.decrypt(alg, key, toU8(toAB(data)))
).then(r => {
  if (r == null) throw new Error('decrypt failed');
  return toU8(r).buffer;
});

crypto.subtle.deriveBits = (alg, baseKey, len) => maybePromise(
  native.deriveBits(alg, baseKey, len)
).then(r => {
  if (r == null) throw new Error('deriveBits failed');
  return toU8(r).buffer;
});

crypto.subtle.deriveKey = (alg, baseKey, derivedAlg, ext, usages) => maybePromise(
  native.deriveKey(alg, baseKey, derivedAlg, !!ext, Array.from(usages || []))
).then(r => {
  if (r == null) throw new Error('deriveKey failed');
  return r;
});

/* ---------- crypto.getRandomValues ---------- */
crypto.subtle.getRandomValues = ta => maybePromise(native.getRandomValues(ta.length))
  .then(b => { ta.set(toU8(b)); return ta; });

globalThis.crypto = crypto;