# ReFlux

Redo flux. An exercise I gave to myself.
Of course largely learned from [flux architecture](https://github.com/facebook/flux).

## Dispatcher

### register/unregister

A store registers a callback during its initialization to receive payloads.

### dispatch/waitFor

We need an algorithm for the sequence of callback invocation.

## Store

- Attach to a dispatcher by providing its `consumeAction` as callback of dispatcher.
- `consumeAction` get called once new action comes in. It reduces action to generate store's new state and pass new state to listeners.

Note that current implementation simplifies [EventEmitter](https://github.com/facebook/emitter) used in original flux architecture.

The store does not shallow compare state changes in `consumeAction` for now, thus every action invokes listeners.
