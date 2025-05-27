// Gun configuration options
export const gunOptions = {
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    // Add your own peers here
  ],
  localStorage: false, // Set to true to enable localStorage persistence
  //   radisk: true,        // Enable radisk storage
  axe: true, // Enable AXE for conflict resolution
}; 