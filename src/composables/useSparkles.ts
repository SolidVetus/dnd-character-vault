import { sparkles } from 'party-js'

export function useSparkles() {
  function playSparkles(target: HTMLElement | null | undefined) {
    if (
      !target ||
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    sparkles(target)
  }

  return { playSparkles }
}
