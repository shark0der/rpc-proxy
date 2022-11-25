# Dynamic RPC proxy

Proxy requests to different Ethereum RPC servers and optionally alter the request.

## Usage

1. Run `npm install` to install dependencies.
2. Copy `config.js.example` to `config.js` and edit it to your needs. See below for details.
3. Run `npm start` to run the proxy.

## Configuration

### Port

The `port` key defines the port number the proxy should listen on.

### RPCs

The `rpcs` key defines the list of upstream RPC servers. The `rpcs` is an object with keys being the
name of the RPC and the value being the URL.

### Fallback

The `fallback` key defines the fallback RPC to use if none of the rules matched.

### Rules

Each rule is an object with the following properties:

`matchers`:

Matchers are functions that take three parameters (`httpMethod, headers, body`) and return a `boolean`.
They are used to match requests to rules. The matchers will be called in the order the rules are
defined. **Only the first matching rule will be used.**.

`actions`:

Actions are used to modify requests before they are sent to the RPC. An action is a function that
takes three parameters (`httpMethod, headers, body`) and returns an object
`{ method, headers, body }` with the modified request.

`rpc`:

The name of the RPC to proxy to if the rule matched. The RPC must be defined in the `rpcs` section.

## Example config: send transactions to Flashbots Protect RPC

```javascript
const matchers = require('./src/matchers');
const actions = require('./src/actions');

module.exports = {
  port: 8545,
  rpcs: {
    infura: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    flashbots: 'https://rpc.flashbots.net',
  },
  fallback: 'infura',
  rules: [
    { matcher: matchers.isRawTx, action: actions.identity, rpc: 'flashbots' },
    { matcher: matchers.any, action: actions.identity, rpc: 'infura' },
  ],
};
```

This configuration will send all requests to `infura` except for raw transactions, which will be
sent to `flashbots`. This provides transparently private transactions while avoiding spamming
flashbots protect rpc with requests. **This was the main motivation and goal of the project**.

## Example config: send transactions to Flashbots relay

```javascript
const matchers = require('./src/matchers');
const actions = require('./src/actions');

module.exports = {
  port: 8545,
  rpcs: {
    infura: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    flashbots: 'https://relay.flashbots.net',
  },
  fallback: 'infura',
  rules: [
    { matcher: matchers.isRawTx, action: actions.makeTxPrivate, rpc: 'flashbots' },
    { matcher: matchers.any, action: actions.identity, rpc: 'infura' },
  ],
};
```

This configuration will send all requests to `infura` except for raw transactions, which will be
sent to `flashbots` and will be made private by changing the rpc method from
`eth_sendRawTransaction` to `eth_sendPrivateTransaction`.

Heads up: Currently the `makeTxPrivate` lacks `X-Flashbots-Signature` header implementation.

## License

MIT
