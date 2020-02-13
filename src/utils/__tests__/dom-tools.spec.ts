import * as domTools from '../dom-tools';


describe('DOM tools: toggleClass ...', () => {
    it('toggle css class', () => {
        const element = {
            className: 'one two three'
        };
        domTools.toggleClass(element as any, 'four', true);
        expect(element.className).toEqual('one two three four');
        domTools.toggleClass(element as any, 'two', true);
        expect(element.className).toEqual('one two three four');
        domTools.toggleClass(element as any, 'four', false);
        expect(element.className).toEqual('one two three');
        domTools.toggleClass(element as any, 'one', false);
        expect(element.className).toEqual('two three');
    });
});