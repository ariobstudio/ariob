# @gun

This is a modular version of the [Gun](https://gun.eco/) database library, allowing for more fine-grained imports and customization for native libraries

## Installation

```bash
npm install @gun
# or
yarn add @gun
# or 
pnpm add @gun
```

## Usage

### Basic Usage

```javascript
// Import the full Gun library
const Gun = require('@gun');

// Create a Gun instance
const gun = Gun();

// Use it normally
gun.get('users').put({ name: 'Alice' });
```

### SEA (Security, Encryption, and Authorization)

```javascript
// Import Gun with SEA
const Gun = require('@gun');
const SEA = Gun.SEA;

// Use SEA functions
async function example() {
  const pair = await SEA.pair();
  const encrypted = await SEA.encrypt('secret data', pair);
  console.log(encrypted);
}
```

### Modular Usage

You can import individual modules directly:

```javascript
// Import specific components
const root = require('@gun/src/root');
const chain = require('@gun/src/chain');
const mesh = require('@gun/src/mesh');

// Import specific lib utilities
const store = require('@gun/lib/store');
const radix = require('@gun/lib/radix');

// Import specific SEA components
const sea = require('@gun/sea/root');
```

## Benefits of Modular Imports

- Better control over which parts of Gun you use
- Customization of individual components to be used in native
- Easier debugging and testing of individual components
- Better TypeScript support

## Documentation

For full documentation, see the [official Gun documentation](https://gun.eco/docs). 