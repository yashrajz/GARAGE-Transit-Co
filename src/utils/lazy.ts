import { lazy } from 'react'

/** React.lazy + explicit preload handle so idle time can warm route chunks. */
export function lazyWithPreload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  let preloaded: Promise<{ default: T }> | null = null
  const Component = lazy(() => {
    preloaded ??= factory()
    return preloaded
  })
  ;(Component as unknown as { preload?: () => void }).preload = () => {
    preloaded ??= factory()
  }
  return Component as T extends never ? never : typeof Component & { preload?: () => void }
}
