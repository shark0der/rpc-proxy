const express = require('express');
const fetch = require('node-fetch');
const config = require('../config');

const app = express();
app.use(express.json());

const omit = (object, keys) => {
  const entries = Object.entries(object);
  const filtered = entries.filter(([key]) => !keys.includes(key));
  return Object.fromEntries(filtered);
};

app.use(async (req, res) => {
  const { fallback, rpcs, rules } = config;
  const rule = rules.find(rule => rule.matcher(req));

  if (!rule) {
    console.log(`No rule found for request: ${req.method} ${req.url}`);
    return res.status(404).send('Not Found');
  }

  const omitted = ['host', 'content-length'];
  const { method, headers, body } = rule.action(req.method, omit(req.headers, omitted), req.body);
  const rpc = rule.rpc || fallback;

  console.log(
    `Proxing ${req.body.method}` +
      (req.body.method !== body.method ? `as ${body.method}` : '') +
      ` via ${rpc}`,
  );

  try {
    const opts = { method, headers, body: JSON.stringify(body) };
    const url = rpcs[rpc];
    const response = await fetch(url, opts);

    res.header('content-type', response.headers.get('content-type'));
    res.status(response.status);
    res.send(await response.text());
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(config.port, () => {
  console.log(`RPC proxy has started and is listening on port ${config.port}`);
});
