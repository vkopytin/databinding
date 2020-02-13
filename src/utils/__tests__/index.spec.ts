import * as utils from '../index';


describe('tools array: forEach map filter reduce ...', () => {
    it('just dummy test', () => {
        const out = [1, 2, 3, 4, 5, 6];
        const expected = [1, 2, 3, 4, 5, 6];
        expect(out).toStrictEqual(expected);
    });

    it('checking forEach', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const out = [];
        const expected = ['0:1', '2:2', '6:3', '12:4', '20:5', '30:6'];
        utils.forEach(arr, (item, index, arr) => { out.push('' + (item * index) + ':' + arr[index]) });
        expect(out).toStrictEqual(expected);
    });

    it('checking map', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const expected = ['0:1', '2:2', '6:3', '12:4', '20:5', '30:6'];
        const out = utils.map(arr, (item, index, arr) => '' + (item * index) + ':' + arr[index]);
        expect(out).toStrictEqual(expected);
    });

    it('checking filter', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const expected1 = [1, 3, 5];
        const expected2 = [2, 4, 6];
        const out1 = utils.filter(arr, (item, index, arr) => {
            return item % 2;
        });
        const out2 = utils.filter(arr, (item, index, arr) => {
            return !(item % 2);
        });
        expect(out1).toStrictEqual(expected1);
        expect(out2).toStrictEqual(expected2);
    });

    it('checking reduce', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const expected1 = [100, 0, 2, 6, 12, 20, 30];
        const expected2 = [99, 0, 2, 6, 12, 20, 30];
        const expected3 = [0, 1, 3, 5];
        const out1 = utils.reduce(arr, (res = [100], item, index) => {
            return [...res, item * index];
        });
        const out2 = utils.reduce(arr, (res, item, index) => {
            return [...res,  item * index];
        }, [99]);
        const out3 = utils.reduce(arr, (res, item, index) => {
            if (item % 2) {
                return [...res, item];
            }
            return res;
        }, [0]);
        expect(out1).toStrictEqual(expected1);
        expect(out2).toStrictEqual(expected2);
        expect(out3).toStrictEqual(expected3);
    });

    it('checking unique', () => {
        const arr = [1, 2, 3, 1, 2, 3, 4, 1, 1, 2, 3, 1, 2, 3, 4, 1, 2, 5, 6, 3, 6, 5, 5, 7, 4, 2, 5, 6, 3, 6, 5, 5, 7, 4];
        const expected = [1, 2, 3, 4, 5, 6, 7];
        const out = utils.unique(arr);
        expect(out).toStrictEqual(expected);
    });

    it('checking find', () => {
        const expected = {};
        const arr = [1, 2, 3, 1, 2, 3, , expected, 4, 1, 2, 5, 6, 3, 6, 5, 5, 7, 4];
        const out = utils.find(arr, i => i === expected);
        expect(out).toStrictEqual(expected);
    });

    it('checking strEquals', () => {
        const left = 'checking one';
        const right = 'checking two';
        const left1 = 'checking on';
        const right1 = 'checking oj';
        const left2 = 'checking on';
        const right2 = 'checking on';
        const res = utils.strEquals(left, right);
        const res1 = utils.strEquals(left1, right1);
        const res2 = utils.strEquals(left2, right2);
        expect(res).toStrictEqual(false);
        expect(res1).toStrictEqual(false);
        expect(res2).toStrictEqual(true);
    });
});

describe('tools async Queue', () => {
    it('check async Queue', testDone => {
        const queue = utils.asyncQueue();
        const out = [];
        const expected = [1, 2, 3, 4, 5];
        queue.push(done1 => {
            queue.push(done2 => {
                queue.push(done3 => {
                    queue.push(done4 => {
                        out.push(5);
                        expect(out).toStrictEqual(expected);
                        testDone();
                        done4();
                    });
                    out.push(4)
                    done3();
                });
                out.push(2);
                done2();
            });
            queue.push(done5 => {
                out.push(3);
                done5();
            });
            out.push(1);
            done1();
        });
    });

    it('check async Queue with Priorities', testDone => {
        const queue = utils.asyncQueueWithPriority();
        const out = [];
        const expected = ['11', '12', '21', '22', '31', '32', '41', '42', '51'];
        queue.push(done1 => {
            queue.push(done4 => {
                out.push('41');
                setTimeout(() => done4(), 10);
            }, 4);
            queue.push(done5 => {
                out.push('51');
                expect(out).toStrictEqual(expected);
                testDone();
                done5();
            }, 5);
            queue.push(done2 => {
                out.push('21');
                setTimeout(() => done2());
            }, 2);
            queue.push(done3 => {
                out.push('31');
                setTimeout(() => done3(), 10);
            }, 3);
            queue.push(done4 => {
                out.push('42');
                setTimeout(() => done4());
            }, 4);
            queue.push(done3 => {
                out.push('32');
                setTimeout(() => done3());
            }, 3);
            queue.push(done2 => {
                out.push('22');
                setTimeout(() => done2(), 10);
            }, 2);
            out.push('11');
            setTimeout(() => done1());
        });
        queue.push(done => {
            out.push('12');
            done();
        });
    });

    it('className should return classes according to match pattern', () => {
        expect(utils.className('test')).toEqual('test');
        expect(utils.className('one two three', true)).toEqual('one two three');
        expect(utils.className('?one', false)).toEqual('');
        expect(utils.className('?one', true)).toEqual('one');
        expect(utils.className('one ?two three')).toEqual('one three');
        expect(utils.className('one ?two three', false)).toEqual('one three');
        expect(utils.className('one ?two three', true)).toEqual('one two three');
        expect(utils.className('one ?two ?three', true, true)).toEqual('one two three');
        expect(utils.className('one ?two ?three', true, false)).toEqual('one two');

    });
    
});