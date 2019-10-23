import * as BB from 'backbone';


class BaseView<T extends BB.Model> extends BB.View<T> {
    set$Val(selector, value) {
        const oldValue = this.$(selector).val();
        if (oldValue !== value) {
            this.$(selector).val(value);
        }
    }

    get$Val(selector) {
        return '' + this.$(selector).val();
    }
}

export { BaseView };
