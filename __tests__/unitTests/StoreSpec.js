const Store = require('../../src/Store');

describe('Store', () => {
    class TestStore extends Store {}

    const name = 'TestStore';
    const dispatcher = { registerCallback: () => null };
    const reduce = (prevState, action) => action;
    const initialState = {};

    describe('improperly initialized', () => {
        it('should throw without reduce', () => {
            expect(() => new TestStore(name, dispatcher, undefined, initialState))
                .toThrow();
        });

        it('should throw without initialState', () => {
            expect(() => new TestStore(name, dispatcher, reduce, undefined))
                .toThrow();
        });
    });
});
