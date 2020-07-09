import * as React from 'react'
import useConstant from 'use-constant'
import useForceUpdate from 'use-force-update'

/**
 * Easily manage an ordered list of refs in React.
 */
export function useRefList() {
  const forceUpdate = useForceUpdate()
  const refs = React.useRef([])
  const shouldCollectRefs = React.useRef(null)
  const snapshots = React.useRef([])
  const version = React.useRef(0)
  // mutableSource is only responsible for updating a number so we can
  // trigger an update in children
  const mutableSource = useConstant(() =>
    React.createMutableSource(null, () => version.current)
  )

  React.useLayoutEffect(() => {
    if (shouldCollectRefs.current === true) {
      // bump the version so we can use it in the snapshot to update the component
      version.current += 1

      // clear items out before collecting them again
      refs.current = []

      // call each snapshot to schedule an update
      snapshots.current.forEach((snapshot) => snapshot())

      // return shouldCollectItems to original state and update the parent hook once more
      shouldCollectRefs.current = null

      forceUpdate()
    } else {
      shouldCollectRefs.current = false
    }
  })

  const useRef = React.useCallback((key, initialValue) => {
    const ref = React.useRef(initialValue)

    React.useMutableSource(
      // we exclusively use a mutable source to propagate updates to components to fix their indexes
      mutableSource,
      // we update the component when the "version" has changed in the parent useLayoutEffect
      React.useCallback(() => version.current, []),
      // we store snapshots to schedule updates in the parent useLayoutEffect
      React.useCallback((_, snapshot) => {
        snapshots.current.push(snapshot)
        return () => {
          snapshots.current = snapshots.current.filter(
            (_snapshot) => _snapshot !== snapshot
          )
        }
      }, [])
    )

    let index = refs.current.findIndex((ref) => ref.key === key)

    if (index === -1) {
      index = refs.current.length
      refs.current.push({ ref, key })
    }

    React.useLayoutEffect(() => {
      return () => {
        // schedule an update when this hook unmounts
        forceUpdate()
        shouldCollectRefs.current = true
      }
    }, [])

    React.useLayoutEffect(() => {
      if (shouldCollectRefs.current === false) {
        // schedule an update in the parent so we can recollect children after this render
        forceUpdate()
        shouldCollectRefs.current = true
      }
    })

    return [ref, index]
  }, [])

  return [refs, useRef]
}
