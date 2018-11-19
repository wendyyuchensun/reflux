const React = require('react');
const TestRenderer = require('react-test-renderer');

const Dispatcher = require('../../src/Dispatcher');
const Store = require('../../src/Store');
const Container = require('../../src/Container');

describe('Integrated tests', () => {
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

    describe('Dispatcher, Store & Container', () => {
        const Cmpt = props => React.createElement('span', null, props.text);

        const createContainer = (stores, getState) => TestRenderer.create(
            React.createElement(Container, { Cmpt, stores, getState }, null)
        );

        const renderContainer = Container => TestRenderer.create(Container);

        it('should work together properly', () => {
            const dispatcher = new Dispatcher();

            const initialState = { text: '' };

            let storeB;
            const reduceA = (prevState, action) => {
                dispatcher.waitForCallbacks([storeB.getDispatchToken()]);
                return action.storeAState;
            };
            const storeA = new Store('StoreA', dispatcher, reduceA, initialState);
            const reduceB = (prevState, action) => action.storeBState;
            storeB = new Store('StoreB', dispatcher, reduceB, initialState);

            const containerAStores = [storeA];
            const spy = jest.fn();
            const containerAGetState = () => {
                spy();
                return { text: storeA.getState().text };
            };
            const ContainerA = createContainer(containerAStores, containerAGetState);

            const containerBStores = [storeA, storeB];
            const containerBGetState = () => { 
                if (storeA.getState().text && storeB.getState().text) {
                    return {
                        text: `${storeA.getState().text}-${storeB.getState().text}`
                    };
                } 

                return initialState;
            };
            const ContainerB = createContainer(containerBStores, containerBGetState);

            expect(ContainerA.toJSON()).toMatchSnapshot();
            expect(ContainerB.toJSON()).toMatchSnapshot();

            const action1 = {
                storeAState: {
                    text: 'foo',
                },
                storeBState: {
                    text: 'bar',
                }
            };

            dispatcher.dispatch(action1);
            expect(ContainerA.toJSON()).toMatchSnapshot();
            expect(ContainerB.toJSON()).toMatchSnapshot();

            const action2 = {
                storeAState: {
                    text: 'baz',
                },
                storeBState: {
                    text: 'zoo',
                }
            };

            dispatcher.unregisterCallback(storeB.getDispatchToken());
            dispatcher.dispatch(action2);
            expect(ContainerA.toJSON()).toMatchSnapshot();
            expect(ContainerB.toJSON()).toMatchSnapshot();

            const spyCalledNumsBeforeLastDispatch = spy.mock.calls.length;
            const action3 = {
                storeAState: {
                    text: 'woo',
                },
                storeBState: {
                    text: 'too',
                }
            };

            ContainerA.unmount();
            dispatcher.dispatch(action3);
            expect(ContainerA.toJSON()).toMatchSnapshot();
            expect(ContainerB.toJSON()).toMatchSnapshot();
            expect(spy.mock.calls.length).toEqual(spyCalledNumsBeforeLastDispatch);
        });
    });
});
