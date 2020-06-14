import { EVENT_NAMES } from './virtualDom';


const dom = {
    eventHandlers: [],
    closest(el, selector) {
        return el.closest(selector);
    },
    attach(inst, selector, eventName, fn) {
        const pair = dom.eventHandlers.find(([key]) => fn === key);
        const index = dom.eventHandlers.indexOf(pair);
        if (index >= 0) {
            throw new Error(`Event handler ${fn} for event ${eventName} already attached`);
        }
        let detach;
        const handler = function (evnt) {
            if (selector && dom.closest(evnt.target, selector)) {
                fn(evnt);
            } else if (!selector) {
                fn(evnt);
            }
        };
        inst.addEventListener(eventName, handler);
        dom.eventHandlers.push([fn, handler]);
        return detach = function () {
            const pair = dom.eventHandlers.find(([, h]) => handler === h);
            const index = dom.eventHandlers.indexOf(pair);
            if (index >= 0) {
                inst.removeEventListener(eventName, handler);
            } else {
                throw new Error(`Error in detach result. Can't detach unexisting ${eventName} handler`);
            }
        };
    },
    detach(inst, eventName, fn) {
        const pair = dom.eventHandlers.find(([key]) => fn === key);
        const [, handler] = pair;
        const index = dom.eventHandlers.indexOf(pair);
        if (index >= 0) {
            dom.eventHandlers.splice(index, 1);
            inst.removeEventListener(eventName, handler);
        } else {
            throw new Error(`Error in detach method. Can't detach unexisting ${eventName} handler`);
        }
    },
    el(type, attrs, ...children) {
        attrs = attrs || {};
        children = [].concat(...children);
        const el = document.createElement(type);
        const attrNames = Object.keys(attrs);
        attrNames.forEach(attrName => {
            if (attrName in EVENT_NAMES) {
                const eventName = EVENT_NAMES[attrName];
                dom.attach(el, '', eventName, attrs[attrName]);
            } else if (attrName in el) {
                el[attrName] = attrs[attrName];
            } else {
                el.setAttribute(attrName, attrs[attrName]);
            }
        });
        for (const child of [...children]) {
            el.append(child);
        }

        return el;
    }
};

export { dom };
