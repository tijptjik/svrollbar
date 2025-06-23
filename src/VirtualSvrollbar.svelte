<script lang="ts">
  // SVELTE
  import { fade } from 'svelte/transition'
  import { untrack } from 'svelte'

  // ═══════════════════════
  // 1. PROPS
  // ═══════════════════════

  const {
    viewportHeight,
    contentsHeight,
    scrollTop,
    hideAfter = 1000,
    alwaysVisible = false,
    initiallyVisible = false,
    margin = {},
    vTrackIn = (node: HTMLElement) => fade(node, { duration: 100 }),
    vTrackOut = (node: HTMLElement) => fade(node, { duration: 300 }),
    vThumbIn = (node: HTMLElement) => fade(node, { duration: 100 }),
    vThumbOut = (node: HTMLElement) => fade(node, { duration: 300 }),
    onshow,
    onhide,
  }: {
    viewportHeight: number
    contentsHeight: number
    scrollTop: number
    hideAfter?: number
    alwaysVisible?: boolean
    initiallyVisible?: boolean
    margin?: { top?: number; right?: number; bottom?: number; left?: number }
    vTrackIn?: (node: HTMLElement) => any
    vTrackOut?: (node: HTMLElement) => any
    vThumbIn?: (node: HTMLElement) => any
    vThumbOut?: (node: HTMLElement) => any
    onshow?: () => void
    onhide?: () => void
  } = $props()

  // ═══════════════════════
  // 2. STATE
  // ═══════════════════════

  let vTrack: HTMLElement = $state(null!)
  let vThumb: HTMLElement = $state(null!)
  let visible = $state(false)
  let interacted = $state(false)
  let timer = $state(0)
  let startTop = $state(0)
  let startY = $state(0)

  // ═══════════════════════
  // 3. DERIVED VALUES
  // ═══════════════════════

  const marginTop = $derived(margin.top ?? 0)
  const marginBottom = $derived(margin.bottom ?? 0)
  const marginRight = $derived(margin.right ?? 0)
  const marginLeft = $derived(margin.left ?? 0)

  const trackHeight = $derived(viewportHeight - (marginTop + marginBottom))
  const thumbHeight = $derived(
    contentsHeight > 0 ? (trackHeight / contentsHeight) * trackHeight : 0
  )
  const thumbTop = $derived(contentsHeight > 0 ? (scrollTop / contentsHeight) * trackHeight : 0)

  const scrollable = $derived(contentsHeight > trackHeight)
  const shouldBeVisible = $derived(scrollable && (alwaysVisible || initiallyVisible))

  // ═══════════════════════
  // 4. EFFECTS
  // ═══════════════════════

  // Handle visibility and scroll changes
  $effect(() => {
    if (scrollTop !== undefined && scrollable) {
      untrack(() => {
        clearTimer()
        setupTimer()
        if (!visible) {
          visible = true
          onshow?.()
        }
        if (!interacted) {
          interacted = true
        }
      })
    } else if (!scrollable) {
      untrack(() => {
        visible = false
      })
    } else {
      // Initial state
      untrack(() => {
        visible = shouldBeVisible
      })
    }
  })

  // Track setup
  $effect(() => {
    if (vTrack) {
      untrack(() => {
        const handleTrackEnter = () => clearTimer()
        const handleTrackLeave = () => {
          clearTimer()
          setupTimer()
        }

        vTrack.addEventListener('mouseenter', handleTrackEnter)
        vTrack.addEventListener('mouseleave', handleTrackLeave)

        return () => {
          vTrack.removeEventListener('mouseenter', handleTrackEnter)
          vTrack.removeEventListener('mouseleave', handleTrackLeave)
        }
      })
    }
  })

  // Thumb setup
  $effect(() => {
    if (vThumb) {
      untrack(() => {
        const handleThumbDown = (event: MouseEvent | TouchEvent) => {
          event.stopPropagation()
          event.preventDefault()

          startTop = scrollTop
          startY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY

          document.addEventListener('mousemove', handleThumbMove)
          document.addEventListener('touchmove', handleThumbMove)
          document.addEventListener('mouseup', handleThumbUp)
          document.addEventListener('touchend', handleThumbUp)
        }

        const handleThumbMove = (event: MouseEvent | TouchEvent) => {
          event.stopPropagation()
          event.preventDefault()

          const clientY =
            'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY
          const ratio = contentsHeight / trackHeight

          // Dispatch custom event with new scroll position
          const newScrollTop = startTop + ratio * (clientY - startY)
          window.dispatchEvent(
            new CustomEvent('virtualscroll', {
              detail: { scrollTop: newScrollTop },
            })
          )
        }

        const handleThumbUp = (event: MouseEvent | TouchEvent) => {
          event.stopPropagation()
          event.preventDefault()

          startTop = 0
          startY = 0

          document.removeEventListener('mousemove', handleThumbMove)
          document.removeEventListener('touchmove', handleThumbMove)
          document.removeEventListener('mouseup', handleThumbUp)
          document.removeEventListener('touchend', handleThumbUp)
        }

        vThumb.addEventListener('mousedown', handleThumbDown, { passive: true })
        vThumb.addEventListener('touchstart', handleThumbDown, { passive: true })

        return () => {
          vThumb.removeEventListener('mousedown', handleThumbDown)
          vThumb.removeEventListener('touchstart', handleThumbDown)
        }
      })
    }
  })

  // ═══════════════════════
  // 5. TIMERS
  // ═══════════════════════

  function setupTimer() {
    timer = window.setTimeout(() => {
      visible = (scrollable && (alwaysVisible || (initiallyVisible && !interacted))) || false
      onhide?.()
    }, hideAfter)
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer)
      timer = 0
    }
  }
</script>

{#if visible}
  <div
    class="v-scrollbar"
    style="height: {trackHeight}px; margin: {marginTop}px {marginRight}px {marginBottom}px {marginLeft}px">
    <div
      bind:this={vTrack}
      class="v-track"
      style="height: {trackHeight}px"
      in:vTrackIn
      out:vTrackOut>
    </div>
    <div
      bind:this={vThumb}
      class="v-thumb"
      style="height: {thumbHeight}px; top: {thumbTop}px"
      in:vThumbIn
      out:vThumbOut>
    </div>
  </div>
{/if}

<style>
  .v-scrollbar {
    position: absolute;
    top: 0;
    right: 0;
    width: var(--svrollbar-track-width, 10px);
    pointer-events: none;
  }

  .v-scrollbar:hover .v-thumb {
    opacity: 1;
  }

  .v-track {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    width: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 1);
    background: var(--svrollbar-track-background, initial);
    box-shadow: var(--svrollbar-track-shadow, initial);
    pointer-events: auto;
  }

  .v-thumb {
    position: relative;
    margin: 0 auto;
    border-radius: var(--svrollbar-thumb-radius, 0.25rem);
    width: var(--svrollbar-thumb-width, 6px);
    opacity: var(--svrollbar-thumb-opacity, 0.5);
    background: var(--svrollbar-thumb-background, gray);
    box-shadow: var(--svrollbar-thumb-shadow, initial);
    pointer-events: auto;
    cursor: pointer;
  }
</style>
