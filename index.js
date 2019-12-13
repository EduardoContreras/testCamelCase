const express = require('express');
const app = express();
const xmlparser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const { every, isObject, isArray, map, mapValues, camelCase, has, eq } = require('lodash');
const camelcaseKeys = require('camelcase-keys');

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

const toCamelCase = items =>
  mapValues(items, item => {
    if (isArray(item) &&
        every(item, it => typeof(it) === 'string' && !eq(it, ''))) {
      const trnsfrm = map(item, ite => camelCase(ite));
      return trnsfrm;
    } else if (isObject(item) && !has(item, 'anyOf')) {
      return toCamelCase(item);
    }
    return item;
  });

app.post('/', function (req, res) {
  let body = camelcaseKeys(req.body, { deep: true, stopPaths: [] });
  body = toCamelCase(body);
  res.send(body);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
