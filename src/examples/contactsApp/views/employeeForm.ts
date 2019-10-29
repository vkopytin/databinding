import * as BB from 'backbone';
import * as _ from 'underscore';
import template = require('../templates/employeeForm.mustache');
import { EmployeeModel } from '../models/main';


class EmployeeForm extends BB.View<EmployeeModel> {
    events() {
        const res = _.result(BB.View.prototype, 'events') as ReturnType<typeof BB.View.prototype.events>;
        return {
            ...res,
            'submit .employee-form': 'onFormSubmit'
        };
    }
  
    render() {
        const html = template({
            ...this.model.toJSON(),
            isNew: this.model.isNew()
        });
        this.$el.append(html);
        return this;
    }
  
    onFormSubmit(e) {
        e.preventDefault();
  
        this.trigger('form:submitted', {
            name: this.$('.employee-name-input').val(),
            tel: this.$('.employee-tel-input').val(),
            email: this.$('.employee-email-input').val(),
            avatar: '13.svg'
        });
    }
}

export { EmployeeForm };
