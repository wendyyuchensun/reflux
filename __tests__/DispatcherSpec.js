const Dispatcher = require('../src/Dispatcher');

describe('Dispatcher', () => {
    let dispatcher;
    let callbackA;
    let callbackB;

    beforeEach(() => {
        dispatcher = new Dispatcher();
        callbackA = jest.fn();
        callbackB = jest.fn();
    });

    it('should dispatch action to all registered callbacks', () => {
        dispatcher.registerCallback(callbackA);
        dispatcher.registerCallback(callbackB);

        const action = {};
        dispatcher.dispatch(action);

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackA).toHaveBeenCalledWith(action);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledWith(action);
    });

    it('should properly unregister callbacks', () => {
        dispatcher.registerCallback(callbackA);
        const callbackBToken = dispatcher.registerCallback(callbackB);

        const action = {};
        dispatcher.dispatch(action);

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackA).toHaveBeenCalledWith(action);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledWith(action);

        dispatcher.unregisterCallback(callbackBToken);

        dispatcher.dispatch(action);

        expect(callbackA).toHaveBeenCalledTimes(2);
        expect(callbackA).toHaveBeenNthCalledWith(2, action);
        expect(callbackB).toHaveBeenCalledTimes(1);
    });

    it('should wait for callbacks registered later', () => {
        let callbackBToken;

        dispatcher.registerCallback(action => {
            dispatcher.waitForCallbacks([callbackBToken]);

            expect(callbackB).toHaveBeenCalledTimes(1);
            expect(callbackB).toHaveBeenCalledWith(action);

            callbackA(action);
        });

        callbackBToken = dispatcher.registerCallback(callbackB);

        const action = {};
        dispatcher.dispatch(action);

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackA).toHaveBeenCalledWith(action);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledWith(action);
    });

    it('should throw on self-circular dependencies', () => {
        const callbackAToken = dispatcher.registerCallback(action => {
            dispatcher.waitForCallbacks([callbackAToken]);
            callbackA(action);
        });

        expect(() => dispatcher.dispatch()).toThrow();
        expect(callbackA).toHaveBeenCalledTimes(0);
    });

    it('should throw on multiple-circular dependencies', () => {
        let callbackBToken;

        const callbackAToken = dispatcher.registerCallback(action => {
            dispatcher.waitForCallbacks([callbackBToken]);
            callbackA(action);
        });

        callbackBToken = dispatcher.registerCallback(action => {
            dispatcher.waitForCallbacks([callbackAToken]);
            callbackB(action);
        });

        expect(() => dispatcher.dispatch()).toThrow();
        expect(callbackA).toHaveBeenCalledTimes(0);
        expect(callbackB).toHaveBeenCalledTimes(0);
    });

    it('should only invoke each callback once in a dispatch', () => {
        let callbackAToken;

        dispatcher.registerCallback(() => dispatcher.waitForCallbacks([callbackAToken]));
        dispatcher.registerCallback(() => dispatcher.waitForCallbacks([callbackAToken]));

        callbackAToken = dispatcher.registerCallback(callbackA);

        dispatcher.dispatch();
        expect(callbackA).toHaveBeenCalledTimes(1);
    });

    it('should remain in a consistent state after a failed dispatch', () => {
        dispatcher.registerCallback(callbackA);
        dispatcher.registerCallback(action => {
            if (action.shouldThrow) throw new Error();
            callbackB(action);
        });

        expect(() => dispatcher.dispatch({ shouldThrow: true })).toThrow();

        const callbackACalledTimes = callbackA.mock.calls.length;
        dispatcher.dispatch({});
        expect(callbackA).toHaveBeenCalledTimes(callbackACalledTimes + 1);
        expect(callbackB).toHaveBeenCalledTimes(1);
    });
});
