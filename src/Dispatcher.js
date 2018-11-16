class Dispatcher {
    constructor() {
        this._callbacks = {};
        this._newCallbackTokenID = 0;

        this._isDispatching = false;
        this._pendingAction = null;
        this._pendingCallbacks = {};
        this._handledCallbacks = {};
    }

    registerCallback(callback) {
        const newCallbackToken = `callback-${this._newCallbackTokenID}`;
        this._callbacks[newCallbackToken] = callback;
        this._newCallbackTokenID++;
        return newCallbackToken;
    }

    unregisterCallback(callbackToken) {
        delete this._callbacks[callbackToken];
    }

    waitForCallbacks(callbackTokens) {
        for (let i = 0; i < callbackTokens.length; i++) {
            const callbackToken = callbackTokens[i];

            if (this._pendingCallbacks[callbackToken]) {
                throw new Error('Callbacks cannot have circular dependencies.');
            }

            this._invokeCallback(callbackToken);
        }
    }

    dispatch(action) {
        this._startDispatching(action);

        try {
            for (const callbackToken in this._callbacks) {
                this._invokeCallback(callbackToken);
            }        
        } finally {
            this._stopDispatching();
        }
    }

    _startDispatching(action) {
        this._pendingAction = action;

        for (const callbackToken in this._callbacks) {
            this._pendingCallbacks[callbackToken] = false;
            this._handledCallbacks[callbackToken] = false;
        }
    }

    _invokeCallback(callbackToken) {
        if (this._handledCallbacks[callbackToken]) return;

        this._pendingCallbacks[callbackToken] = true;
        this._callbacks[callbackToken](this._pendingAction);
        this._pendingCallbacks[callbackToken] = false;
        this._handledCallbacks[callbackToken] = true;
    }

    _stopDispatching() {
        this._pendingAction = null;
        this._pendingCallbacks = {};
        this._handledCallbacks = {};
    }
}

module.exports = Dispatcher;
