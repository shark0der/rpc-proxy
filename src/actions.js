const identity = (method, headers, body) => ({ method, headers, body });

const makeTxPrivate = (method, headers, body) => {
  const [tx] = body.params;
  return {
    method,
    // FIXME: implement X-Flashbots-Signature header
    headers,
    body: { ...body, method: 'eth_sendPrivateTransaction', params: [{ tx }] },
  };
};

module.exports = {
  identity,
  makeTxPrivate,
};
