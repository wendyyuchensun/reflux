class Store {
    constructor(name, dispatcher, reduce, initialState = {}) {
        this._name = name;
        this._dispatcherToken = dispatcher.registerCallback(this.consumeAction); 

        if (!reduce) throw new Error('A store must have a reduce function');
        this._reduce = reduce;

        this._listeners = {};
        this._newListenerID = 0;

        this._state = initialState;
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
