/**
 * Unified pointer event utilities for handling both mouse and touch events
 */

/**
 * Gets the Y coordinate from either a mouse or touch event, adjusted for scroll.
 * scrollTop should be the scrollTop of the container element (0 when the page itself scrolls).
 */
export function getPointerY(
    event: React.MouseEvent | React.TouchEvent,
    containerRect: DOMRect,
    offset: number = 0,
    scrollTop: number = 0,
): number {
    if ('touches' in event) {
        return event.touches[0].clientY - containerRect.top + scrollTop - offset;
    }
    return event.clientY - containerRect.top + scrollTop - offset;
}

/**
 * Checks if the event target or its parent matches a selector
 */
export function isTargetOrParent(target: EventTarget | null, selector: string): boolean {
    if (!target) return false;
    const element = target as HTMLElement;
    return Boolean(element.closest(selector));
}
