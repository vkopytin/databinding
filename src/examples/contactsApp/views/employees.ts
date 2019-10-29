import * as BB from 'backbone';
import * as _ from 'underscore';
import { EmployeeView } from './employee';
import { EmployeeModel } from '../models/main';
import template = require('../templates/employees.mustache');
import { EmployeeCollection } from '../collections/main';


class EmployeesView extends BB.View<EmployeeModel> {
    collection = this.initCollection(this.collection);

    initCollection(collection = new EmployeeCollection()) {
        this.collection && this.stopListening(this.collection);

        this.listenTo(collection, 'change', m => this.$('.console-log').html(JSON.stringify(m.toJSON())));

        return collection;
    }

    drawItem(employee) {
        const itemView = new EmployeeView({ model: employee });
        this.$('.contacts-container').append(itemView.render().$el);
    }

    drawItems() {
        this.collection.each(this.drawItem, this);
    }

    render() {
        const html = template();
        this.$el.html(html);
  
        this.drawItems();
  
        return this;
    }
}

export { EmployeesView };
