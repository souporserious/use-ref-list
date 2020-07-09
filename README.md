# 🤹 use-ref-list

Easily manage an ordered list of refs in React.

[Codesandbox Demo](https://codesandbox.io/s/use-ref-list-oh0xu)

## Why not useRef?

This library aims to solve the problem of obtaining a list of refs where the order matters like when interacting with lists for keyboard controls. It does so by utilizing [`useMutableSource`](https://github.com/reactjs/rfcs/blob/master/text/0147-use-mutable-source.md) to collect refs in the order they appear in the rendered tree no matter if they are memoized or deep within the tree.

## Install

```bash
yarn add use-ref-list
```

```bash
npm install use-ref-list
```

## Usage

Due to the use of `useMutableSource` internally, this package only works with the experiemental version of React right now.

```bash
yarn add react@experimental react-dom@experimental
```

_Since this library relies on an impure render to collect refs, it is not advised for use on the server and should rather be accessed imperatively after JavaScript has loaded._

## useRefList () => [refs, useRef]

The main export that returns an array of refs as well as an instance hook that's used to subscribe refs.

### refs [{ ref, key }]

This is a collection of the currently subscribed refs.

### useRef (key, initialValue) => [ref, index]

This should be used in place of the normal `React.useRef`. The ref will be collected at each call site and added to the returned `refs` array from `useRefList`.

_This hook should only be called once in a component._

## Example

```jsx
import * as React from 'react'
import { useRefList } from 'use-ref-list'

function ListItem({ useRef, children }) {
  const id = React.unstable_useOpaqueIdentifier()
  const [ref, refIndex] = useRef(id)
  return (
    <li ref={ref}>
      {children} {refIndex}
    </li>
  )
}

function App() {
  const [refs, useRef] = useRefList()
  React.useLayoutEffect(() => {
    // access to all collected refs
    console.log(refs.current)
  }, [])
  return (
    <ul>
      <ListItem useRef={useRef}>Item 1</ListItem>
      <ListItem useRef={useRef}>Item 2</ListItem>
      <ListItem useRef={useRef}>Item 3</ListItem>
    </ul>
  )
}
```
