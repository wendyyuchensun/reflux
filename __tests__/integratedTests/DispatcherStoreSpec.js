const Dispatcher = require('../../src/Dispatcher');
const Store = require('../../src/Store');

describe('Dispatcher & Store', () => {
    let dispatcher;

    let listenerA;
    let listenerB;

    const reduceA = (prevState, action) => Object.assign(prevState, action.storeAState);
    const reduceB = (prevState, action) => Object.assign(prevState, action.storeBState);

    const initialState = {};

    const action = {
        storeAState: { foo: 'bar' },
        storeBState: { foo: 'baz' }
    };

    beforeEach(() => {
        dispatcher = new Dispatcher();
        listenerA = jest.fn(args => expect(args).toEqual(action.storeAState));
        listenerB = jest.fn(args => expect(args).toEqual(action.storeBState));
    });

    it('Dispatcher should dispatch actions to registered stores', () => {
        const storeA = new Store('StoreA', dispatcher, reduceA, initialState);
        storeA.addListener(listenerA);
        expect(listenerA).toHaveBeenCalledTimes(0);

        dispatcher.dispatch(action);
        expect(listenerA).toHaveBeenCalledTimes(1);

        const storeB = new Store('StoreB', dispatcher, reduceB, initialState);
        storeB.addListener(listenerB);
        expect(listenerB).toHaveBeenCalledTimes(0);

        dispatcher.dispatch(action);
        expect(listenerA).toHaveBeenCalledTimes(2);
        expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it('Dispatcher should not dispatch actions to unregistered stores', () => {
        const storeA = new Store('StoreA', dispatcher, reduceA, initialState);
        storeA.addListener(listenerA);
        expect(listenerA).toHaveBeenCalledTimes(0);

        const storeB = new Store('StoreB', dispatcher, reduceB, initialState);
        storeB.addListener(listenerB);
        expect(listenerB).toHaveBeenCalledTimes(0);

        dispatcher.dispatch(action);
        expect(listenerA).toHaveBeenCalledTimes(1);
        expect(listenerB).toHaveBeenCalledTimes(1);

        dispatcher.unregisterCallback(storeB.getDispatchToken());

        dispatcher.dispatch(action);
        expect(listenerA).toHaveBeenCalledTimes(2);
        expect(listenerB).toHaveBeenCalledTimes(1);
    });
});
