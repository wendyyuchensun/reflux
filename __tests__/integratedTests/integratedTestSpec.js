const React = require('react');
const TestRenderer = require('react-test-renderer');

const Dispatcher = require('../../src/Dispatcher');
const Store = require('../../src/Store');
const Container = require('../../src/Container');

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
        const containerAGetState = () => ({ text: storeA.getState().text });
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
    });
});
