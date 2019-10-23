class ValueConvertor {
    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static isString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    static isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    static toNumber(obj) {
        return +obj;
    }

    static toString(obj) {
        return '' + obj;
    }

    static toBoolean(obj) {
        return !!obj;
    }

    static changeType(obj, targetInst) {
        const objType = typeof obj;
        const targetType = typeof targetInst;
        if (objType !== 'object') {
            if (objType === targetType) {
                return obj;
            }
        }

        if (ValueConvertor.isNumber(targetInst)) {
            return ValueConvertor.toNumber(obj);
        }
        if (ValueConvertor.isString(targetInst)) {
            return ValueConvertor.toString(obj);
        }
        if (ValueConvertor.isBoolean(targetInst)) {
            return ValueConvertor.toBoolean(obj);
        }

        return obj;
    }
}

export { ValueConvertor };
