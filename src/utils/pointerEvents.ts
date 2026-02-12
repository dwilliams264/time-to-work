/**
 * Unified pointer event utilities for handling both mouse and touch events
 */

/**
 * Gets the Y coordinate from either a mouse or touch event
 */
export function getPointerY(
    event: React.MouseEvent | React.TouchEvent,
    containerRect: DOMRect,
    offset: number = 0,
): number {
    if ('touches' in event) {
        return event.touches[0].clientY - containerRect.top - offset;
    }
    return event.clientY - containerRect.top - offset;
}

/**
 * Checks if the event target or its parent matches a selector
 */
export function isTargetOrParent(target: EventTarget | null, selector: string): boolean {
    if (!target) return false;
    const element = target as HTMLElement;
    return Boolean(element.closest(selector));
}
