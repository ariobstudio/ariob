(() => {
  /* UNBUILD */
  function USE(arg, req) {
    return req
      ? req(arg)
      : arg.slice
        ? USE[R(arg)]
        : (mod, path) => {
            arg((mod = { exports: {} }));
            USE[R(path)] = mod.exports;
          };
    function R(p) {
      return p.split('/').slice(-1).toString().replace('.js', '');
    }
  }
  if (typeof module !== 'undefined') {
    var MODULE = module;
  }
  /* UNBUILD */

  USE((module) => {
    // Security, Encryption, and Authorization: SEA.js
    // MANDATORY READING: https://gun.eco/explainers/data/security.html
    // IT IS IMPLEMENTED IN A POLYFILL/SHIM APPROACH.
    // THIS IS AN EARLY ALPHA!

    if (typeof self !== 'undefined') {
      module.window = self;
    } // should be safe for at least browser/worker/nodejs, need to check other envs like RN etc.
    if (typeof window !== 'undefined') {
      module.window = window;
    }

    var tmp = module.window || module,
      u;
    var SEA = tmp.SEA || {};

    if ((SEA.window = module.window)) {
      SEA.window.SEA = SEA;
    }

    try {
      if (u + '' !== typeof MODULE) {
        MODULE.exports = SEA;
      }
    } catch (e) {}
    module.exports = SEA;
  })(USE, './root');
  USE((module) => {
    var SEA = USE('./root');
    try {
      if (SEA.window) {
        if (
          location.protocol.indexOf('s') < 0 &&
          location.host.indexOf('localhost') < 0 &&
          !/^127\.\d+\.\d+\.\d+$/.test(location.hostname) &&
          location.protocol.indexOf('blob:') < 0 &&
          location.protocol.indexOf('file:') < 0 &&
          location.origin != 'null'
        ) {
          console.warn('HTTPS needed for WebCrypto in SEA, redirecting...');
          location.protocol = 'https:'; // WebCrypto does NOT work without HTTPS!
        }
      }
    } catch (e) {}
  })(USE, './https');
  USE((module) => {
    var u;
    if (u + '' == typeof btoa) {
      // if(u+'' == typeof Buffer){
      //   try{ global.Buffer = require("buffer", 1).Buffer }catch(e){ console.log("Please `npm install buffer` or add it to your package.json !") }
      // }
      global.btoa = (data) =>
        NativeModules.NativeWebCryptoModule.textEncode(data);
      global.atob = (data) =>
        NativeModules.NativeWebCryptoModule.textDecode(data);
    }
  })(USE, './base64');
  USE((module) => {
    USE('./base64');
    // This is Array extended to have .toString(['utf8'|'hex'|'base64'])
    function SeaArray() {}
    Object.assign(SeaArray, { from: Array.from });
    SeaArray.prototype = Object.create(Array.prototype);
    SeaArray.prototype.toString = function (enc, start, end) {
      enc = enc || 'utf8';
      start = start || 0;
      const length = this.length;
      if (enc === 'hex') {
        const buf = new Uint8Array(this);
        return [...Array(((end && end + 1) || length) - start).keys()]
          .map((i) => buf[i + start].toString(16).padStart(2, '0'))
          .join('');
      }
      if (enc === 'utf8') {
        return Array.from({ length: (end || length) - start }, (_, i) =>
          String.fromCharCode(this[i + start]),
        ).join('');
      }
      if (enc === 'base64') {
        return btoa(this);
      }
    };
    module.exports = SeaArray;
  })(USE, './array');
  USE((module) => {
    USE('./base64');
    // This is Buffer implementation used in SEA. Functionality is mostly
    // compatible with NodeJS 'safe-buffer' and is used for encoding conversions
    // between binary and 'hex' | 'utf8' | 'base64'
    // See documentation and validation for safe implementation in:
    // https://github.com/feross/safe-buffer#update
    var SeaArray = USE('./array');
    function SafeBuffer(...props) {
      console.warn(
        'new SafeBuffer() is depreciated, please use SafeBuffer.from()',
      );
      return SafeBuffer.from(...props);
    }
    SafeBuffer.prototype = Object.create(Array.prototype);
    Object.assign(SafeBuffer, {
      // (data, enc) where typeof data === 'string' then enc === 'utf8'|'hex'|'base64'
      from() {
        if (!Object.keys(arguments).length || arguments[0] == null) {
          throw new TypeError(
            'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.',
          );
        }
        const input = arguments[0];
        let buf;
        if (typeof input === 'string') {
          const enc = arguments[1] || 'utf8';
          if (enc === 'hex') {
            const bytes = input
              .match(/([\da-fA-F]{2})/g)
              .map((byte) => Number.parseInt(byte, 16));
            if (!bytes || !bytes.length) {
              throw new TypeError("Invalid first argument for type 'hex'.");
            }
            buf = SeaArray.from(bytes);
          } else if (enc === 'utf8' || 'binary' === enc) {
            // EDIT BY MARK: I think this is safe, tested it against a couple "binary" strings. This lets SafeBuffer match NodeJS Buffer behavior more where it safely btoas regular strings.
            const length = input.length;
            const words = new Uint16Array(length);
            Array.from(
              { length: length },
              (_, i) => (words[i] = input.charCodeAt(i)),
            );
            buf = SeaArray.from(words);
          } else if (enc === 'base64') {
            const dec = atob(input);
            const length = dec.length;
            const bytes = new Uint8Array(length);
            Array.from(
              { length: length },
              (_, i) => (bytes[i] = dec.charCodeAt(i)),
            );
            buf = SeaArray.from(bytes);
          } else if (enc === 'binary') {
            // deprecated by above comment
            buf = SeaArray.from(input); // some btoas were mishandled.
          } else {
            console.info('SafeBuffer.from unknown encoding: ' + enc);
          }
          return buf;
        }
        const byteLength = input.byteLength; // what is going on here? FOR MARTTI
        const length = input.byteLength ? input.byteLength : input.length;
        if (length) {
          let buf;
          if (input instanceof ArrayBuffer) {
            buf = new Uint8Array(input);
          }
          return SeaArray.from(buf || input);
        }
      },
      // This is 'safe-buffer.alloc' sans encoding support
      alloc(length, fill = 0 /*, enc*/) {
        return SeaArray.from(
          new Uint8Array(Array.from({ length: length }, () => fill)),
        );
      },
      // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
      allocUnsafe(length) {
        return SeaArray.from(new Uint8Array(Array.from({ length: length })));
      },
      // This puts together array of array like members
      concat(arr) {
        // octet array
        if (!Array.isArray(arr)) {
          throw new TypeError(
            'First argument must be Array containing ArrayBuffer or Uint8Array instances.',
          );
        }
        return SeaArray.from(
          arr.reduce((ret, item) => ret.concat(Array.from(item)), []),
        );
      },
    });
    SafeBuffer.prototype.from = SafeBuffer.from;
    SafeBuffer.prototype.toString = SeaArray.prototype.toString;

    module.exports = SafeBuffer;
  })(USE, './buffer');
  USE((module) => {
    const SEA = USE('./root');
    const api = { Buffer: USE('./buffer') };
    var o = {},
      u;

    // ideally we can move away from JSON entirely? unlikely due to compatibility issues... oh well.
    JSON.parseAsync =
      JSON.parseAsync ||
      ((t, cb, r) => {
        var u;
        try {
          cb(u, JSON.parse(t, r));
        } catch (e) {
          cb(e);
        }
      });
    JSON.stringifyAsync =
      JSON.stringifyAsync ||
      ((v, cb, r, s) => {
        var u;
        try {
          cb(u, JSON.stringify(v, r, s));
        } catch (e) {
          cb(e);
        }
      });

    api.parse = (t, r) =>
      new Promise((res, rej) => {
        JSON.parseAsync(
          t,
          (err, raw) => {
            err ? rej(err) : res(raw);
          },
          r,
        );
      });
    api.stringify = (v, r, s) =>
      new Promise((res, rej) => {
        JSON.stringifyAsync(
          v,
          (err, raw) => {
            err ? rej(err) : res(raw);
          },
          r,
          s,
        );
      });

    if (SEA.window) {
      api.crypto = SEA.window.crypto || SEA.window.msCrypto;
      api.subtle = (api.crypto || o).subtle || (api.crypto || o).webkitSubtle;
      api.TextEncoder = SEA.window.TextEncoder;
      api.TextDecoder = SEA.window.TextDecoder;
      api.random = (len) =>
        api.Buffer.from(
          api.crypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))),
        );
    }
    // if(!api.TextDecoder)
    // {
    //   const { TextEncoder, TextDecoder } = USE((u+'' == typeof MODULE?'.':'')+'./lib/text-encoding', 1);
    //   api.TextDecoder = TextDecoder;
    //   api.TextEncoder = TextEncoder;
    // }
    // if(!api.crypto)
    // {
    //   try
    //   {
    //   var crypto = USE('crypto', 1);
    //   Object.assign(api, {
    //     crypto,
    //     random: (len) => api.Buffer.from(crypto.randomBytes(len))
    //   });
    //   const { Crypto: WebCrypto } = USE('@peculiar/webcrypto', 1);
    //   api.ossl = api.subtle = new WebCrypto({directory: 'ossl'}).subtle // ECDH
    // }
    // catch(e){
    //   console.log("Please `npm install @peculiar/webcrypto` or add it to your package.json !");
    // }}

    module.exports = api;
  })(USE, './shim');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var s = {};
    s.pbkdf2 = { hash: { name: 'SHA-256' }, iter: 100000, ks: 64 };
    s.ecdsa = {
      pair: { name: 'ECDSA', namedCurve: 'P-256' },
      sign: { name: 'ECDSA', hash: { name: 'SHA-256' } },
    };
    s.ecdh = { name: 'ECDH', namedCurve: 'P-256' };

    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    s.jwk = (pub, d) => {
      // d === priv
      pub = pub.split('.');
      var x = pub[0],
        y = pub[1];
      var jwk = { kty: 'EC', crv: 'P-256', x: x, y: y, ext: true };
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if (d) {
        jwk.d = d;
      }
      return jwk;
    };

    s.keyToJwk = (keyBytes) => {
      const keyB64 = keyBytes.toString('base64');
      const k = keyB64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/\=/g, '');
      return { kty: 'oct', k: k, ext: false, alg: 'A256GCM' };
    };

    s.recall = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: (props) => props, // { iat, exp, alias, remember } // or return new Promise((resolve, reject) => resolve(props)
    };

    s.check = (t) => typeof t == 'string' && 'SEA{' === t.slice(0, 4);
    s.parse = async function p(t) {
      try {
        var yes = typeof t == 'string';
        if (yes && 'SEA{' === t.slice(0, 4)) {
          t = t.slice(3);
        }
        return yes ? await shim.parse(t) : t;
      } catch (e) {}
      return t;
    };

    SEA.opt = s;
    module.exports = s;
  })(USE, './settings');
  USE((module) => {
    var shim = USE('./shim');
    module.exports = async (d, o) => {
      var t = typeof d == 'string' ? d : await shim.stringify(d);
      var hash = await NativeModules.NativeWebCryptoModule.digest(
        JSON.stringify({ name: o || 'SHA-256' }),
        NativeModules.NativeWebCryptoModule.textEncode(t),
      );
      return shim.Buffer.from(hash);
    };
  })(USE, './sha256');
  USE((module) => {
    // This internal func returns SHA-1 hashed data for KeyID generation
    const __shim = USE('./shim');
    const subtle = __shim.subtle;
    const ossl = __shim.ossl ? __shim.ossl : subtle;
    const sha1hash = (b) => ossl.digest({ name: 'SHA-1' }, new ArrayBuffer(b));
    module.exports = sha1hash;
  })(USE, './sha1');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    SEA.work =
      SEA.work ||
      (async (data, pair, cb, opt) => {
        try {
          // used to be named `proof`
          var salt = (pair || {}).epub || pair; // epub not recommended, salt should be random!
          opt = opt || {};
          if (salt instanceof Function) {
            cb = salt;
            salt = u;
          }
          data = typeof data == 'string' ? data : await shim.stringify(data);
          if ('sha' === (opt.name || '').toLowerCase().slice(0, 3)) {
            var rsha = shim.Buffer.from(
              await sha(data, opt.name),
              'binary',
            ).toString(opt.encode || 'base64');
            if (cb) {
              try {
                cb(rsha);
              } catch (e) {
                console.log(e);
              }
            }
            return rsha;
          }
          salt = salt || NativeModules.NativeWebCryptoModule.getRandomValues(9);
          var key = await NativeModules.NativeWebCryptoModule.importKey(
            'raw',
            NativeModules.NativeWebCryptoModule.textEncode(data),
            JSON.stringify({ name: opt.name || 'PBKDF2' }),
            false,
            JSON.stringify(['deriveBits']),
          );
          var work = await NativeModules.NativeWebCryptoModule.deriveBits(
            JSON.stringify({
              name: opt.name || 'PBKDF2',
              iterations: opt.iterations || S.pbkdf2.iter,
              salt: NativeModules.NativeWebCryptoModule.textEncode(
                opt.salt || salt,
              ),
              hash: opt.hash || JSON.stringify(S.pbkdf2.hash),
            }),
            key,
            opt.length || S.pbkdf2.ks * 8,
          );
          data = NativeModules.NativeWebCryptoModule.getRandomValues(
            data.length,
          ); // Erase data in case of passphrase
          var r = shim.Buffer.from(work, 'binary').toString(
            opt.encode || 'base64',
          );
          if (cb) {
            try {
              cb(r);
            } catch (e) {
              console.log(e);
            }
          }
          return r;
        } catch (e) {
          console.log(e);
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            cb();
          }
          return;
        }
      });

    module.exports = SEA.work;
  })(USE, './work');
  USE((module) => {
    var SEA = USE('./root');

    SEA.name =
      SEA.name ||
      (async (cb, opt) => {
        try {
          if (cb) {
            try {
              cb();
            } catch (e) {
              console.log(e);
            }
          }
          return;
        } catch (e) {
          console.log(e);
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            cb();
          }
          return;
        }
      });

    //SEA.pair = async (data, proof, cb) => { try {
    SEA.pair =
      SEA.pair ||
      (async (cb, opt) => {
        try {
          // Generate ECDSA keys for signing/verifying
          var signingKeys =
            await NativeModules.NativeWebCryptoModule.generateKey(
              JSON.stringify({ name: 'ECDSA', namedCurve: 'P-256' }),
              true,
              JSON.stringify(['sign', 'verify']),
            );

          var keyPair = JSON.parse(signingKeys);
          var privateJWK = JSON.parse(
            await NativeModules.NativeWebCryptoModule.exportKey(
              'jwk',
              JSON.stringify(keyPair.privateKey),
            ),
          );
          var publicJWK = JSON.parse(
            await NativeModules.NativeWebCryptoModule.exportKey(
              'jwk',
              JSON.stringify(keyPair.publicKey),
            ),
          );

          // Generate ECDH keys for encryption/decryption
          var encryptionKeys =
            await NativeModules.NativeWebCryptoModule.generateKey(
              JSON.stringify({ name: 'ECDH', namedCurve: 'P-256' }),
              true,
              JSON.stringify(['deriveKey']),
            );

          var ecdhKeyPair = JSON.parse(encryptionKeys);
          var ePrivJWK = JSON.parse(
            await NativeModules.NativeWebCryptoModule.exportKey(
              'jwk',
              JSON.stringify(ecdhKeyPair.privateKey),
            ),
          );
          var ePubJWK = JSON.parse(
            await NativeModules.NativeWebCryptoModule.exportKey(
              'jwk',
              JSON.stringify(ecdhKeyPair.publicKey),
            ),
          );

          // Create the result object with pub/priv and epub/epriv
          var result = {
            pub: publicJWK.x + '.' + publicJWK.y,
            priv: privateJWK.d,
            epub: ePubJWK.x + '.' + ePubJWK.y,
            epriv: ePrivJWK.d,
          };

          if (cb) {
            cb(result);
          }
          return result;
        } catch (e) {
          console.log('Key generation error:', e);
          if (cb) {
            cb();
          }
          return null;
        }
      });

    module.exports = SEA.pair;
  })(USE, './pair');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    SEA.sign =
      SEA.sign ||
      (async (data, pair, cb, opt) => {
        try {
          if (!pair || !pair.priv) {
            throw 'No signing key.';
          }

          var json = await S.parse(data);
          var jwk = S.jwk(pair.pub, pair.priv);
          var hash = await sha(json);

          var key = await NativeModules.NativeWebCryptoModule.importKey(
            'jwk',
            JSON.stringify(jwk),
            JSON.stringify({ name: 'ECDSA', namedCurve: 'P-256' }),
            false,
            JSON.stringify(['sign']),
          );

          var sig = await NativeModules.NativeWebCryptoModule.sign(
            JSON.stringify({ name: 'ECDSA', hash: { name: 'SHA-256' } }),
            key,
            hash.toString('base64'),
          );

          var result = {
            m: json,
            s: shim.Buffer.from(sig, 'binary').toString('base64'),
          };

          var resultStr = 'SEA' + (await shim.stringify(result));

          if (cb) {
            cb(resultStr);
          }
          return resultStr;
        } catch (e) {
          console.log('Signing error:', e);
          if (cb) {
            cb();
          }
          return null;
        }
      });

    module.exports = SEA.sign;
  })(USE, './sign');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    // Updated verify – now assuming signatures are DER encoded.
    SEA.verify =
      SEA.verify ||
      (async (data, pair, cb, opt) => {
        try {
          var json = await S.parse(data);

          if (!json || !json.m || !json.s) {
            throw 'Invalid signature format';
          }

          var pub = pair.pub || pair;

          // Import the public key
          var key = await NativeModules.NativeWebCryptoModule.importKey(
            'jwk',
            JSON.stringify(S.jwk(pub)),
            JSON.stringify({ name: 'ECDSA', namedCurve: 'P-256' }),
            false,
            JSON.stringify(['verify']),
          );

          var hash = await sha(json.m);
          var buf = shim.Buffer.from(json.s, 'base64');

          var check = await NativeModules.NativeWebCryptoModule.verify(
            JSON.stringify({ name: 'ECDSA', hash: { name: 'SHA-256' } }),
            key,
            buf.toString('base64'),
            hash.toString('base64'),
          );

          if (!check) {
            throw 'Signature did not match.';
          }

          var result = check ? await S.parse(json.m) : undefined;
          if (cb) {
            cb(result);
          }
          return result;
        } catch (e) {
          console.log('Verification error:', e);
          if (cb) {
            cb();
          }
          return null;
        }
      });

    module.exports = SEA.verify;
    // legacy & ossl memory leak mitigation:

    var knownKeys = {};
    var keyForPair = (SEA.opt.slow_leak = (pair) => {
      if (knownKeys[pair]) return knownKeys[pair];
      var jwk = S.jwk(pair);
      knownKeys[pair] = (shim.ossl || shim.subtle).importKey(
        'jwk',
        jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify'],
      );
      return knownKeys[pair];
    });

    var O = SEA.opt;
    SEA.opt.fall_verify = async (data, pair, cb, opt, f) => {
      if (f === SEA.opt.fallback) {
        throw 'Signature did not match';
      }
      f = f || 1;
      var tmp = data || '';
      data = SEA.opt.unpack(data) || data;
      var json = await S.parse(data),
        pub = pair.pub || pair,
        key = await SEA.opt.slow_leak(pub);
      var hash =
        f <= SEA.opt.fallback
          ? shim.Buffer.from(
              await shim.subtle.digest(
                { name: 'SHA-256' },
                new shim.TextEncoder().encode(await S.parse(json.m)),
              ),
            )
          : await sha(json.m); // this line is old bad buggy code but necessary for old compatibility.
      var buf;
      var sig;
      var check;
      try {
        buf = shim.Buffer.from(json.s, opt.encode || 'base64'); // NEW DEFAULT!
        sig = new Uint8Array(buf);
        check = await (shim.ossl || shim.subtle).verify(
          { name: 'ECDSA', hash: { name: 'SHA-256' } },
          key,
          sig,
          new Uint8Array(hash),
        );
        if (!check) {
          throw 'Signature did not match.';
        }
      } catch (e) {
        try {
          buf = shim.Buffer.from(json.s, 'utf8'); // AUTO BACKWARD OLD UTF8 DATA!
          sig = new Uint8Array(buf);
          check = await (shim.ossl || shim.subtle).verify(
            { name: 'ECDSA', hash: { name: 'SHA-256' } },
            key,
            sig,
            new Uint8Array(hash),
          );
        } catch (e) {
          if (!check) {
            throw 'Signature did not match.';
          }
        }
      }
      var r = check ? await S.parse(json.m) : u;
      O.fall_soul = tmp['#'];
      O.fall_key = tmp['.'];
      O.fall_val = data;
      O.fall_state = tmp['>'];
      if (cb) {
        try {
          cb(r);
        } catch (e) {
          console.log(e);
        }
      }
      return r;
    };
    SEA.opt.fallback = 2;
  })(USE, './verify');
  USE((module) => {
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');

    const importGen = async (key, salt, opt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      opt = opt || {};
      const combo =
        key +
        (
          salt || NativeModules.NativeWebCryptoModule.getRandomValues(8)
        ).toString('utf8');
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary');

      const jwkKey = S.keyToJwk(hash);
      return await NativeModules.NativeWebCryptoModule.importKey(
        'jwk',
        JSON.stringify(jwkKey),
        JSON.stringify({ name: 'AES-GCM' }),
        false,
        JSON.stringify(['encrypt', 'decrypt']),
      );
    };
    module.exports = importGen;
  })(USE, './aeskey');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');
    var u;

    SEA.encrypt =
      SEA.encrypt ||
      (async (data, pair, cb, opt) => {
        try {
          opt = opt || {};
          var key = (pair || opt).epriv || pair;
          if (u === data) {
            throw '`undefined` not allowed.';
          }
          if (!key) {
            if (!SEA.I) {
              throw 'No encryption key.';
            }
            pair = await SEA.I(null, {
              what: data,
              how: 'encrypt',
              why: opt.why,
            });
            key = pair.epriv || pair;
          }
          var msg = typeof data == 'string' ? data : await shim.stringify(data);
          var rand = {
            s: NativeModules.NativeWebCryptoModule.getRandomValues(9),
            iv: NativeModules.NativeWebCryptoModule.getRandomValues(15),
          }; // consider making this 9 and 15 or 18 or 12 to reduce == padding.
          var ct = await aeskey(key, rand.s, opt).then((aes) => {
            console.log(
              'Encryption - Params: ',
              JSON.stringify(
                JSON.stringify({
                  name: opt.name || 'AES-GCM',
                  iv: rand.iv,
                }),
                aes,
                NativeModules.NativeWebCryptoModule.textEncode(msg),
              ),
            );
            return NativeModules.NativeWebCryptoModule.encrypt(
              JSON.stringify({
                name: opt.name || 'AES-GCM',
                iv: rand.iv,
              }),
              aes,
              NativeModules.NativeWebCryptoModule.textEncode(msg),
            );
          });
          var r = {
            ct: ct, // ct is already base64 encoded from native module
            iv: rand.iv.toString(opt.encode || 'base64'),
            s: rand.s.toString(opt.encode || 'base64'),
          };
          if (!opt.raw) {
            r = 'SEA' + (await shim.stringify(r));
          }
          console.log('Encryption - Result: ', r);

          if (cb) {
            try {
              cb(r);
            } catch (e) {
              console.log(e);
            }
          }
          return r;
        } catch (e) {
          console.log(e);
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            cb();
          }
          return;
        }
      });

    module.exports = SEA.encrypt;
  })(USE, './encrypt');
  USE((module) => {
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');

    SEA.decrypt =
      SEA.decrypt ||
      (async (data, pair, cb, opt) => {
        try {
          opt = opt || {};
          var key = (pair || opt).epriv || pair;
          if (!key) {
            if (!SEA.I) {
              throw 'No decryption key.';
            }
            pair = await SEA.I(null, {
              what: data,
              how: 'decrypt',
              why: opt.why,
            });
            key = pair.epriv || pair;
          }
          var json = await S.parse(data);
          var buf, bufiv, bufct;
          try {
            buf = shim.Buffer.from(json.s, opt.encode || 'base64');
            bufiv = shim.Buffer.from(json.iv, opt.encode || 'base64');
            bufct = shim.Buffer.from(json.ct, opt.encode || 'base64');
            var ct = await aeskey(key, json.s, opt).then((aes) =>
              NativeModules.NativeWebCryptoModule.decrypt(
                JSON.stringify({
                  // Keeping aesKey scope as private as possible...
                  name: opt.name || 'AES-GCM',
                  iv: json.iv,
                  tagLength: 128,
                }),
                aes,
                json.ct,
              ),
            );
          } catch (e) {
            if ('utf8' === opt.encode) {
              throw 'Could not decrypt';
            }
            if (SEA.opt.fallback) {
              opt.encode = 'utf8';
              return await SEA.decrypt(data, pair, cb, opt);
            }
          }
          var r = await S.parse(
            NativeModules.NativeWebCryptoModule.textDecode(ct),
          );
          if (cb) {
            try {
              cb(r);
            } catch (e) {
              console.log(e);
            }
          }
          return r;
        } catch (e) {
          console.log(e);
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            cb();
          }
          return;
        }
      });

    module.exports = SEA.decrypt;
  })(USE, './decrypt');
  USE((module) => {
    var SEA = USE('./root');

    var createEcdhJwkObject = (pub, d) => {
      // d === priv
      var [x, y] = pub.split('.'); // pub is expected as 'x.y' base64url strings
      var jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: x,
        y: y,
        ext: true, // Default ext to true for public, derived keys might change this
      };
      if (d) {
        jwk.d = d; // Add private component if provided
      }
      return jwk;
    };

    // Derive shared secret from other's pub and my epub/epriv
    SEA.secret =
      SEA.secret ||
      (async (key, pair, cb, opt) => {
        try {
          opt = opt || {};
          if (!pair || !pair.epriv || !pair.epub) {
            if (!SEA.I) {
              throw 'No secret mix.';
            }
            pair = await SEA.I(null, {
              what: key,
              how: 'secret',
              why: opt.why,
            });
            if (!pair || !pair.epriv || !pair.epub) {
              throw 'Could not retrieve key pair for secret derivation.';
            }
          }

          var peerPub = key.epub || key;
          var localEpub = pair.epub;
          var localEpriv = pair.epriv;

          const baseKeyJWK = createEcdhJwkObject(localEpub, localEpriv);
          const peerPublicKeyJWK = createEcdhJwkObject(peerPub);

          const derivationAlgorithm = {
            name: 'ECDH',
            public: peerPublicKeyJWK,
          };

          const derivedKeyType = {
            name: 'AES-GCM',
            length: 256,
          };

          const extractable = false;
          const keyUsages = ['encrypt', 'decrypt'];

          const derivedKeyJWKString =
            await NativeModules.NativeWebCryptoModule.deriveKey(
              JSON.stringify(derivationAlgorithm),
              JSON.stringify(baseKeyJWK),
              JSON.stringify(derivedKeyType),
              extractable,
              JSON.stringify(keyUsages),
            );

          const derivedAesJWK = JSON.parse(derivedKeyJWKString);
          if (derivedAesJWK.error) {
            throw new Error(
              `Native deriveKey failed: ${derivedAesJWK.message}`,
            );
          }

          var r = derivedAesJWK.k;
          if (!r) {
            throw new Error(
              "Native deriveKey succeeded but returned JWK is missing 'k' value.",
            );
          }

          if (cb) {
            try {
              cb(r);
            } catch (e) {
              console.log(e);
            }
          }
          return r;
        } catch (e) {
          console.error('SEA.secret Native Error:', e); // Log the specific error
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            try {
              cb();
            } catch (e) {
              console.log(e);
            }
          }
          return;
        }
      });

    module.exports = SEA.secret;
  })(USE, './secret');
  USE((module) => {
    var SEA = USE('./root');
    // This is to certify that a group of "certificants" can "put" anything at a group of matched "paths" to the certificate authority's graph
    SEA.certify =
      SEA.certify ||
      (async (certificants, policy = {}, authority, cb, opt = {}) => {
        try {
          /*
      The Certify Protocol was made out of love by a Vietnamese code enthusiast. Vietnamese people around the world deserve respect!
      IMPORTANT: A Certificate is like a Signature. No one knows who (authority) created/signed a cert until you put it into their graph.
      "certificants": '*' or a String (Bob.pub) || an Object that contains "pub" as a key || an array of [object || string]. These people will have the rights.
      "policy": A string ('inbox'), or a RAD/LEX object {'*': 'inbox'}, or an Array of RAD/LEX objects or strings. RAD/LEX object can contain key "?" with indexOf("*") > -1 to force key equals certificant pub. This rule is used to check against soul+'/'+key using Gun.text.match or String.match.
      "authority": Key pair or priv of the certificate authority.
      "cb": A callback function after all things are done.
      "opt": If opt.expiry (a timestamp) is set, SEA won't sync data after opt.expiry. If opt.block is set, SEA will look for block before syncing.
      */
          console.log(
            'SEA.certify() is an early experimental community supported method that may change API behavior without warning in any future version.',
          );

          certificants = (() => {
            var data = [];
            if (certificants) {
              if (
                (typeof certificants === 'string' ||
                  Array.isArray(certificants)) &&
                certificants.indexOf('*') > -1
              )
                return '*';
              if (typeof certificants === 'string') return certificants;
              if (Array.isArray(certificants)) {
                if (certificants.length === 1 && certificants[0])
                  return typeof certificants[0] === 'object' &&
                    certificants[0].pub
                    ? certificants[0].pub
                    : typeof certificants[0] === 'string'
                      ? certificants[0]
                      : null;
                certificants.map((certificant) => {
                  if (typeof certificant === 'string') data.push(certificant);
                  else if (typeof certificant === 'object' && certificant.pub)
                    data.push(certificant.pub);
                });
              }

              if (typeof certificants === 'object' && certificants.pub)
                return certificants.pub;
              return data.length > 0 ? data : null;
            }
            return;
          })();

          if (!certificants) return console.log('No certificant found.');

          const expiry =
            opt.expiry &&
            (typeof opt.expiry === 'number' || typeof opt.expiry === 'string')
              ? Number.parseFloat(opt.expiry)
              : null;
          const readPolicy = (policy || {}).read ? policy.read : null;
          const writePolicy = (policy || {}).write
            ? policy.write
            : typeof policy === 'string' ||
                Array.isArray(policy) ||
                policy['+'] ||
                policy['#'] ||
                policy['.'] ||
                policy['='] ||
                policy['*'] ||
                policy['>'] ||
                policy['<']
              ? policy
              : null;
          // The "blacklist" feature is now renamed to "block". Why ? BECAUSE BLACK LIVES MATTER!
          // We can now use 3 keys: block, blacklist, ban
          const block =
            (opt || {}).block || (opt || {}).blacklist || (opt || {}).ban || {};
          const readBlock =
            block.read &&
            (typeof block.read === 'string' || (block.read || {})['#'])
              ? block.read
              : null;
          const writeBlock =
            typeof block === 'string'
              ? block
              : block.write &&
                  (typeof block.write === 'string' || block.write['#'])
                ? block.write
                : null;

          if (!readPolicy && !writePolicy)
            return console.log('No policy found.');

          // reserved keys: c, e, r, w, rb, wb
          const data = JSON.stringify({
            c: certificants,
            ...(expiry ? { e: expiry } : {}), // inject expiry if possible
            ...(readPolicy ? { r: readPolicy } : {}), // "r" stands for read, which means read permission.
            ...(writePolicy ? { w: writePolicy } : {}), // "w" stands for write, which means write permission.
            ...(readBlock ? { rb: readBlock } : {}), // inject READ block if possible
            ...(writeBlock ? { wb: writeBlock } : {}), // inject WRITE block if possible
          });

          const certificate = await SEA.sign(data, authority, null, { raw: 1 });

          var r = certificate;
          if (!opt.raw) {
            r = 'SEA' + JSON.stringify(r);
          }
          if (cb) {
            try {
              cb(r);
            } catch (e) {
              console.log(e);
            }
          }
          return r;
        } catch (e) {
          SEA.err = e;
          if (SEA.throw) {
            throw e;
          }
          if (cb) {
            cb();
          }
          return;
        }
      });

    module.exports = SEA.certify;
  })(USE, './certify');
  USE((module) => {
    var shim = USE('./shim');
    // Practical examples about usage found in tests.
    var SEA = USE('./root');
    SEA.work = USE('./work');
    SEA.sign = USE('./sign');
    SEA.verify = USE('./verify');
    SEA.encrypt = USE('./encrypt');
    SEA.decrypt = USE('./decrypt');
    SEA.certify = USE('./certify');
    //SEA.opt.aeskey = USE('./aeskey'); // not official! // this causes problems in latest WebCrypto.

    SEA.random = SEA.random || shim.random;

    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    SEA.Buffer = SEA.Buffer || USE('./buffer');

    // These SEA functions support now ony Promises or
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    SEA.keyid =
      SEA.keyid ||
      (async (pub) => {
        try {
          // base64('base64(x):base64(y)') => shim.Buffer(xy)
          const pb = shim.Buffer.concat(
            pub
              .replace(/-/g, '+')
              .replace(/_/g, '/')
              .split('.')
              .map((t) => shim.Buffer.from(t, 'base64')),
          );
          // id is PGPv4 compliant raw key
          const id = shim.Buffer.concat([
            shim.Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]),
            pb,
          ]);
          const sha1 = await sha1hash(id);
          const hash = shim.Buffer.from(sha1, 'binary');
          return hash.toString('hex', hash.length - 8); // 16-bit ID as hex
        } catch (e) {
          console.log(e);
          throw e;
        }
      });
    // all done!
    // Obviously it is missing MANY necessary features. This is only an alpha release.
    // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
    // SEA should be a full suite that is easy and seamless to use.
    // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
    // Once logged in, the rest of the code you just read handled automatically signing/validating data.
    // But all other behavior needs to be equally easy, like opinionated ways of
    // Adding friends (trusted public keys), sending private messages, etc.
    // Cheers! Tell me what you think.

    module.exports = SEA;
    // -------------- END SEA MODULES --------------------
    // -- BEGIN SEA+GUN MODULES: BUNDLED BY DEFAULT UNTIL OTHERS USE SEA ON OWN -------
  })(USE, './sea');
})();
