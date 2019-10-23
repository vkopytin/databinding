import * as BB from 'backbone';
import * as $ from 'jquery';
import { BaseView } from './base';
import * as _ from 'underscore';
import template = require('../templates/employee.mustache');
import { EmployeeModel } from '../models/main';
import { bindTo, unbindFrom, dispatch, updateLayout } from '../../databinding';


class EmployeeView extends BaseView<EmployeeModel> {
    binding = bindTo(this, () => this.model, {
        '-$(.testing-template).html': '.$(#custom-template).html',
        '-$(.render-html).click': '.bind(render)',
        '-$(.delete-employee).click': '.bind(onClickDelete)',
        '$(.user-name).val': 'get(name)',
        '$(.user-phone).val': 'get(tel)',
        '$(.user-email).val': 'get(email)',
        '$(.sync-test).text': '.$(.user-name).val'
    });
    options?: ReturnType<EmployeeView['initOptions']>;

    model = this.initModel(this.model);

    constructor(options?: ReturnType<EmployeeView['initOptions']>) {
        super({
            tagName: 'li',
            className: 'media col-md-6 col-lg-4',
            ...options
        });
        this.options = this.initOptions(options);
    }

    initOptions(options = {}) {
        const defOptions = {
            checking: 'test'
        };
        return {
            ...defOptions as Partial<typeof defOptions>,
            ...options as BB.ViewOptions<EmployeeModel>
        };
    }

    initModel(model = new EmployeeModel()) {
        this.model && this.stopListening(this.model);

        this.listenTo(model, 'remove', this.remove);

        return model;
    }

    onClickDelete(evnt) {
      evnt.preventDefault();
      this.model.collection.remove(this.model);
    }

    remove() {
        unbindFrom(this.binding);
        return super.remove();
    }

    render() {
        const html = template(this.model.toJSON());
        this.$el.html(html);
        updateLayout(this.binding);
        //dispatch(this.binding, { propName: 't' });

        return this;
    }
}

export { EmployeeView };
