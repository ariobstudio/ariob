// Declare JSON modules to avoid slow type inference
declare module '*.json' {
  const value: any;
  export default value;
}
