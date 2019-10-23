import * as BB from 'backbone';
import * as _ from 'underscore';


class EmployeeModel extends BB.Model {
    defaults() {
        const res = _.result(BB.Model.prototype, 'defaults') as ReturnType<typeof BB.Model.prototype.defaults>;

        return {
            ...res,
            name: null,
            tel: null,
            email: null,
            avatar: null
        }
    }
}

export { EmployeeModel };
