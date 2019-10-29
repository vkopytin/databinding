import * as BB from 'backbone';
import * as _ from 'underscore';


const routes = (value: {} | (() => {})) => <T extends new (...args) => Y, Y>(target: T) => {
    _.extend(target.prototype, { routes: value });
};

@routes({
    '': 'home',
    'employees': 'showEmployees',
    'employees/new': 'newEmployee',
    'employees/edit/:id': 'editEmployee',
    'login': 'login',
    'callback': 'callback'
})
class EmployeeRouter extends BB.Router {
}

export { EmployeeRouter };
