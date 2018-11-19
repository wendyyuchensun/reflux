const React = require('react');

class Container extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.props.getState();

        const dispatcher = this.props.stores[0].getDispatcher();
        const dispatchTokens = this.props.stores.map(store => store.getDispatchToken());
        dispatcher.registerCallback(() => {
            dispatcher.waitForCallbacks(dispatchTokens);
            this.setState(this.props.getState());
        });
    }

    render() {
        return React.createElement(this.props.Cmpt, this.state, null);
    }
}

module.exports = Container;
