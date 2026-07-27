import 'react'

// React 19's types removed the global `JSX` namespace (it now lives at
// `React.JSX`). react-markdown@8 ships a real `lib/complex-types.ts` source file
// that still references the global namespace, which our tsc run compiles and
// fails on. Restore the global as an alias until react-markdown is upgraded to
// v9+/v10, then delete this shim.
declare global {
  namespace JSX {
    type Element = React.JSX.Element
    type ElementClass = React.JSX.ElementClass
    type ElementType = React.JSX.ElementType
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  }
}
