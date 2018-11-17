const Store = require('../src/Store');

describe('Store', () => {
    class TestStore extends Store {}
    const dispatcher = { registerCallback: () => null };

    describe('improperly initialized', () => {
        it('should throw without reduce', () => {
            expect(() => new TestStore('TestStore', dispatcher)).toThrow();
        });
    });

    describe('properly initialized', () => {
        let store;
        let listenerA;
        let listenerB;

        const reduce = (prevState, action) => action;
        const actionA = { foo: 'bar' };
        const actionB = { foo: 'baz' };

        beforeEach(() => {
            store = new TestStore('TestStore', dispatcher, reduce);
            listenerA = jest.fn();
            listenerB = jest.fn();
        });

        it('should pass action to added listeners', () => {
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

        it('should not pass action to removed listeners', () => {
            store.addListener(listenerA);
            const listenerBToken = store.addListener(listenerB);
            expect(listenerA).toHaveBeenCalledTimes(0);
            expect(listenerB).toHaveBeenCalledTimes(0);

            store.consumeAction(actionA);
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerA).toHaveBeenLastCalledWith(actionA);
            expect(listenerB).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenLastCalledWith(actionA);

            store.removeListener(listenerBToken);
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
