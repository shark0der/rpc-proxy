const any = () => true;

const isRawTx = request => request.body.method === 'eth_sendRawTransaction';

module.exports = {
  any,
  isRawTx,
};
