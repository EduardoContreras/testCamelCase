const express = require('express');
const app = express();
const xmlparser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const { every, isObject, isArray, map, mapValues, mapKeys, camelCase, has, eq, get, isEqual, toPlainObject } = require('lodash');
const camelcaseKeys = require('camelcase-keys');

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

const a = (item) => {
  const retrn = map(item.anyOf, current => {
    if (!isEqual(current, { type: 'null' })) {
      return current;
    } else {
      return {nullable: true};
    }
  });

  let obj = {};
  const rtrn = retrn.reduce(function(result, item, index) {   
    obj = Object.assign({}, obj, item);     
  }, []);

  return obj;
};

const toCamelCaseKeys = item => camelcaseKeys(item, { deep: true, stopPaths: [] })

const setOriginalAttr = (item) => mapKeys(item.properties, (value, key) => {
  item.properties[key]['originalAttrName'] = key;
  return key;
});

const toCamelCase = items =>
  mapValues(items, item => {
    if (isArray(item) &&
        every(item, it => typeof(it) === 'string' && !eq(it, ''))) {
      const trnsfrm = map(item, ite => camelCase(ite));
      return trnsfrm;
    } else if (isObject(item) && !has(item, 'anyOf')) {
      debugger;
      if (has(item, 'properties')) {
        setOriginalAttr(item);
      }
      return toCamelCase(item);    
    } else if (has(item, 'anyOf')) {
      item = a(item);
      if (has(item, 'anyOf')) {
        if (item.anyOf.find(e => has(e, 'enum')) !== undefined) {
          delete item.anyOf.find(e => has(e, 'enum')).enum;
        }
      }     
    }
    return item;
  });

app.post('/', function (req, res) {
  res.send(toCamelCaseKeys(toCamelCase({result: req.body})).result);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
