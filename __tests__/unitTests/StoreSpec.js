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

    describe('properly initialized', () => {
        let store;
        let listenerA;
        let listenerB;

        const actionA = { foo: 'bar' };
        const actionB = { foo: 'baz' };

        beforeEach(() => {
            store = new TestStore(name, dispatcher, reduce, initialState);
            listenerA = jest.fn();
            listenerB = jest.fn();
        });

        it('should pass new state to added listeners', () => {
            store.addListener(listenerA);
            expect(listenerA).toHaveBeenCalledTimes(0);
            expect(listenerB).toHaveBeenCalledTimes(0);

            store.consumeAction(actionA);
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerA).toHaveBeenLastCalledWith(actionA);
            expect(listenerB).toHaveBeenCalledTimes(0);
            
            store.addListener(listenerB);
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenCalledTimes(0);

            store.consumeAction(actionB);
            expect(listenerA).toHaveBeenCalledTimes(2);
            expect(listenerA).toHaveBeenLastCalledWith(actionB);
            expect(listenerB).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenLastCalledWith(actionB);
        });

        it('should not pass new state to removed listeners', () => {
            store.addListener(listenerA);
            const removeListenerB = store.addListener(listenerB);
            expect(listenerA).toHaveBeenCalledTimes(0);
            expect(listenerB).toHaveBeenCalledTimes(0);

            store.consumeAction(actionA);
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerA).toHaveBeenLastCalledWith(actionA);
            expect(listenerB).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenLastCalledWith(actionA);

            removeListenerB();
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenCalledTimes(1);

            store.consumeAction(actionB);
            expect(listenerA).toHaveBeenCalledTimes(2);
            expect(listenerA).toHaveBeenLastCalledWith(actionB);
            expect(listenerB).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenLastCalledWith(actionA);
        });
    });
});
