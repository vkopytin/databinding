import * as $ from 'jquery';
import { MulticastDelegate } from '../databinding/multicastDelegate';


export const jQueryIntegration = [{
    type: $,
    isEqual(left, right) {
        return left[0] === right[0];
    },
    properties: [{
        name: /^addClass\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return !obj.hasClass(name);
        },
        setter(obj: JQuery, name: string, value) {
            return obj.toggleClass(name, !value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^toggleClass\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return obj.hasClass(name);
        },
        setter(obj: JQuery, name: string, value) {
            return obj.toggleClass(name, value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^prop\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return obj.prop(name);
        },
        setter(obj: JQuery, name: string, value) {
            obj.prop(name, value);
        },
        handler: {},
        attach(obj: JQuery, propName: string, handler) {
            const callback = evnt => handler($(evnt.currentTarget), propName);
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('all', callback);
        }
    }, {
        name: /^(\w+\(.*\))$/i,
        getter(obj: JQuery, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj: JQuery, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue);
        },
        handler: {},
        attach(obj: { on; off; }, propName: string, handler) { },
        detach(obj: { on; off; }, propName: string, callback) { }
    }, {
        name: /^(checked)$/,
        getter(obj: JQuery, propName: string) {
            return obj.is(':checked');
        },
        setter(obj: JQuery, propName: string, value) {
            return obj.prop('checked', value);
        },
        handler: {},
        attach(obj: JQuery, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'checked');
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('input', callback);
        }
    }, {
        name: /^(val)$/,
        getter(obj: JQuery, propName: string) {
            return obj.val();
        },
        setter(obj: JQuery, propName: string, v) {
            return obj.val(v);
        },
        handler: {},
        attach(obj: JQuery, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'val');
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('input', callback);
        }
    }, {
        name: /^(text)$/,
        getter(obj: JQuery) {
            return obj.text();
        },
        setter(obj: JQuery, name, v) {
            return obj.text(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^(html)$/,
        getter(obj: JQuery) {
            return obj.html();
        },
        setter(obj: JQuery, name, v) {
            return obj.html(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^(keypress)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('keypress', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('keypress', this.handler.invoke);
        }
    }, {
        name: /^(click)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('click', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('click', this.handler.invoke);
        }
    }, {
        name: /^(dblclick)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('dblclick', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('dblclick', this.handler.invoke);
        }
    }, {
        name: /^(blur)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('blur', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('blur', this.handler.invoke);
        }
    }, {
        name: /^(keydown)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('keydown', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('keydown', this.handler.invoke);
        }
    }]
}];
