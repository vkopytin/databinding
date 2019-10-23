import * as BB from 'backbone';
import { EmployeeModel } from '../models/main';



class EmployeeCollection extends BB.Collection<EmployeeModel> {
    model = EmployeeModel;
}

export { EmployeeCollection };
