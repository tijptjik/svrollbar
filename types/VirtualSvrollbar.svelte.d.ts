/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface VirtualSvrollbarProps {
  /**
   * Height of the viewport in pixels.
   * @required
   */
  viewportHeight: number;

  /**
   * Total height of the scrollable content in pixels.
   * @required
   */
  contentsHeight: number;

  /**
   * Current scroll position from the top in pixels.
   * @required
   */
  scrollTop: number;

  /**
   * milliseconds to keep scrollbar visible.
   * @default 1000
   */
  hideAfter?: number;

  /**
   * make scrollbar always visible if the content is scrollable.
   * @default false
   */
  alwaysVisible?: boolean;

  /**
   * make scrollbar initially visible if the content is scrollable.
   *
   * after you interact with your scrollable contents, scrollbar fallback to the default visibility behavior.
   * @default false
   */
  initiallyVisible?: boolean;

  /**
   * show thumb when hovering over the track and hide when leaving.
   * respects all timer configurations.
   * @default false
   */
  showThumbOnTrackEnter?: boolean;

  /**
   * margin (px) from viewport top, right, bottom and left.
   * @default {}
   */
  margin?: { top?: number; right?: number; bottom?: number; left?: number };

  /**
   * width configuration for track and thumb elements in pixels.
   * @default { track: 10, thumb: 8, thumbActive: 12 }
   */
  width?: { track?: number; thumb?: number; thumbActive?: number };

  /**
   * opacity configuration for track and thumb elements.
   * @default { track: 1, thumb: 0.5, thumbActive: 0.8 }
   */
  opacity?: { track?: number; thumb?: number; thumbActive?: number };

  /**
   * svelte transition to show track in.
   * @default (node) => fade(node, { duration: 100 })
   */
  vTrackIn?: (
    node: HTMLElement,
    params?: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * svelte transition to hide track out.
   * @default (node) => fade(node, { duration: 300 })
   */
  vTrackOut?: (
    node: HTMLElement,
    params?: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * svelte transition to show thumb in.
   * @default (node) => fade(node, { duration: 100 })
   */
  vThumbIn?: (
    node: HTMLElement,
    params?: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * svelte transition to hide thumb out.
   * @default (node) => fade(node, { duration: 300 })
   */
  vThumbOut?: (
    node: HTMLElement,
    params?: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * Callback function called when scrollbar becomes visible.
   * @default undefined
   */
  onshow?: () => void;

  /**
   * Callback function called when scrollbar becomes hidden.
   * @default undefined
   */
  onhide?: () => void;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
}

export default class VirtualSvrollbar extends SvelteComponentTyped<
  VirtualSvrollbarProps,
  { virtualscroll: CustomEvent<{ scrollTop: number }> },
  {}
> {}
