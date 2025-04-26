;(function(){

  var SEA = require('./root');
  var shim = require('./shim'); // May still need shim for non-crypto parts or if SEA.I uses it
  var S = require('./settings'); // May still need settings

  // Assuming NativeModules.NativeWebCryptoModule exists and is bridged

  // Helper to create ECDH JWK objects (modified from original to return object directly)
  var createEcdhJwkObject = (pub, d) => { // d === priv
    var [ x, y ] = pub.split('.'); // pub is expected as 'x.y' base64url strings
    var jwk = {
        kty: "EC",
        crv: "P-256",
        x: x,
        y: y,
        ext: true // Default ext to true for public, derived keys might change this
    };
    if (d) {
        jwk.d = d; // Add private component if provided
        // Usually, private keys intended only for derivation aren't extractable
        // but let's keep ext true for consistency unless deriveKey call specifies otherwise
    }
    return jwk;
  };

  // Derive shared secret from other's pub and my epub/epriv
  SEA.secret = SEA.secret || (async (key, pair, cb, opt) => { try {
    opt = opt || {};
    // Ensure we have the local key pair (epub, epriv)
    if(!pair || !pair.epriv || !pair.epub){
      if(!SEA.I){ throw 'No secret mix.'; }
      // If SEA.I is used, ensure it returns pair in {epub, epriv} format
      pair = await SEA.I(null, {what: key, how: 'secret', why: opt.why});
      if(!pair || !pair.epriv || !pair.epub) {
          throw 'Could not retrieve key pair for secret derivation.';
      }
    }

    // Peer's public key (expecting 'x.y' format or a key object with epub)
    var peerPub = key.epub || key;
    // Local key pair components
    var localEpub = pair.epub;
    var localEpriv = pair.epriv;

    // 1. Prepare parameters for the native deriveKey call

    // a. Construct the baseKey (local private key) JWK
    const baseKeyJWK = createEcdhJwkObject(localEpub, localEpriv);

    // b. Construct the peer's public key JWK
    const peerPublicKeyJWK = createEcdhJwkObject(peerPub); // No 'd' value

    // c. Construct the derivation algorithm specifier
    const derivationAlgorithm = {
        name: "ECDH",
        public: peerPublicKeyJWK // Embed peer's public JWK here
    };

    // d. Construct the derived key type specifier (matching SEA's goal: AES-256-GCM)
    const derivedKeyType = {
        name: "AES-GCM",
        length: 256 // Derive a 256-bit key
    };

    // e. Define extractability and usages for the *derived* AES key
    //    Since SEA.secret only returns 'k', extractable:false seems appropriate.
    //    Usages depend on how this secret might be used later by SEA internally.
    const extractable = false;
    const keyUsages = ["encrypt", "decrypt"]; // Common usages for a derived symmetric key

    // 2. Call the native deriveKey function
    const derivedKeyJWKString = await NativeModules.NativeWebCryptoModule.deriveKey(
        JSON.stringify(derivationAlgorithm),
        JSON.stringify(baseKeyJWK),
        JSON.stringify(derivedKeyType),
        extractable,
        JSON.stringify(keyUsages)
    );

    // 3. Parse the result (should be the derived AES key's JWK as a string)
    const derivedAesJWK = JSON.parse(derivedKeyJWKString);

    // 4. Check for native errors
    if (derivedAesJWK.error) {
        throw new Error(`Native deriveKey failed: ${derivedAesJWK.message}`);
    }

    // 5. Extract the 'k' value (base64url encoded key bytes) required by SEA.secret
    var r = derivedAesJWK.k; // 'k' is the base64url encoded symmetric key material

    if (!r) {
        // This case shouldn't happen if no error was reported, but check anyway
        throw new Error("Native deriveKey succeeded but returned JWK is missing 'k' value.");
    }

    // 6. Return result via callback and promise
    if(cb){ try{ cb(r) }catch(e){console.log(e)} }
    return r;

  } catch(e) {
    console.error("SEA.secret Native Error:", e); // Log the specific error
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ try{ cb() }catch(e){console.log(e)} } // Call callback even on error, possibly with no args
    return; // Return undefined on error
  }});

  // Keep the original helper function name if other parts of the JS code might use it,
  // but note our internal usage changed slightly.
  var keysToEcdhJwk = (pub, d) => { // d === priv
      var [ x, y ] = pub.split('.');
      var jwk = d ? { d: d } : {};
      // Original returned array for subtle.importKey, we just need the object part now.
      return Object.assign(jwk, { x: x, y: y, kty: 'EC', crv: 'P-256', ext: true });
  };
  // Example usage of the original helper if needed elsewhere:
  // var jwkObj = keysToEcdhJwk(peerPub);

  module.exports = SEA.secret;

}());