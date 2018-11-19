class Store {
    constructor(name, dispatcher, reduce, initialState) {
        this._name = name;

        this._dispatcher = dispatcher;
        this._dispatchToken = this._dispatcher
            .registerCallback(this.consumeAction.bind(this)); 

        if (!reduce) throw new Error('A store must have a reduce function');
        this._reduce = reduce;

        if (!initialState) throw new Error('A store must have an initial state');
        this._state = initialState;

        this._listeners = {};
        this._newListenerID = 0;
    }

    getDispatcher() {
        return this._dispatcher;
    }

    getDispatchToken() {
        return this._dispatchToken;
    }

    getState() {
        return this._state;
    }

    consumeAction(action) {
        this._state = this._reduce(this._state, action);
    }
}

module.exports = Store;
