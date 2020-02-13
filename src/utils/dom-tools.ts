export function hasClass(element: Element, className: string) {
    return !!~(element.className || '').split(/\s+/gi).indexOf(className);
}

export function toggleClass(element: Element, className: string, toggle: boolean) {
    const classNames = (element.className || '').split(/\s+/gi);
    const index = classNames.indexOf(className);
    if (toggle) {
        ~index || classNames.push(className);
    } else {
        ~index && classNames.splice(index, 1);
    }

    element.className = classNames.join(' ');

    return element;
}
