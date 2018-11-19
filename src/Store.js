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

    getDispatchToken() {
        return this._dispatchToken;
    }

    addListener(listener) {
        const newListenerToken = `${this._name}Listener-${this._newListenerID}`;
        this._newListenerID++;
        this._listeners[newListenerToken] = listener;
        return newListenerToken;
    }

    removeListener(listenerToken) {
        delete this._listeners[listenerToken];
    }

    consumeAction(action) {
        this._state = this._reduce(this._state, action);
        Object.keys(this._listeners).forEach(listenerToken => {
            this._listeners[listenerToken](this._state);
        });
    }
}

module.exports = Store;
