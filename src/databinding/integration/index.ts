import * as BB from 'backbone';
import * as $ from 'jquery';
import { MulticastDelegate } from '../multicastDelegate';
import * as utils from '../../utils';


interface ITypeDescriptors {
    type: any;
    properties: Array<{
        name: RegExp;
        getter(obj, name: string): any;
        setter(obj, name: string, value): void;
        handler?: { [key: string]: (...args) => any; } | MulticastDelegate;
        attach?(obj: any, propName: string, handler: (o, p: string) => void);
        detach?(obj: any, propName: string, handler: (o, p: string) => void);
    }>;
    isEqual(left, right): boolean;
}

const typeDescriptors: ITypeDescriptors[] = [];

function useIntegration(obj: ITypeDescriptors | ITypeDescriptors[], append = false) {
    if (append) {
        typeDescriptors.push.apply(typeDescriptors, obj);
    } else {
        typeDescriptors.unshift.apply(typeDescriptors, obj);
    }
}

export { useIntegration, typeDescriptors };
