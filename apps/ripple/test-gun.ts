import { gun, sea } from '@ariob/core';

console.log('=== Gun Test ===');
console.log('gun:', typeof gun, gun ? 'exists' : 'undefined');
console.log('sea:', typeof sea, sea ? 'exists' : 'undefined');
console.log('gun.get:', typeof gun?.get);
console.log('sea.random:', typeof sea?.random);
console.log('sea.pair:', typeof sea?.pair);

// Test basic put/get
const testKey = 'test-' + Date.now();
gun.get(testKey).put({ hello: 'world' }, (ack: any) => {
  console.log('Put result:', ack);
});

gun.get(testKey).once((data: any) => {
  console.log('Get result:', data);
});
