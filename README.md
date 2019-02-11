# JSON Streaming Protocol Reader

[![Greenkeeper badge](https://badges.greenkeeper.io/FireBlinkLTD/json-streaming-reader.svg)](https://greenkeeper.io/)
[![CircleCI](https://circleci.com/gh/FireBlinkLTD/json-streaming-reader.svg?style=svg)](https://circleci.com/gh/FireBlinkLTD/json-streaming-reader)
[![codecov](https://codecov.io/gh/FireBlinkLTD/json-streaming-reader/branch/master/graph/badge.svg)](https://codecov.io/gh/FireBlinkLTD/json-streaming-reader)

Simple [JSON streaming](https://en.wikipedia.org/wiki/JSON_streaming) protocol parser that allows to handle each record individually.

## Supported Stream Types

### [Line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON)

Fully supported.

### [Concatenated JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON#Concatenated_JSON)

Supported for non-primitive types. Only objects, arrays and their combination as records are supported.

So, following string value will be parsed correctly:

```
{a: 1}[213]
```

while next will not:

```
{a: 1}null"string"123
```

### [Record separator-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON#Record_separator-delimited_JSON)

Not supported.

### [Length-prefixed JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON#Length-prefixed_JSON)

Not supported.

## Usage

If you use NPM:

```bash
npm i --save json-streaming-reader
```

If you use YARN:

```bash
yarn add json-streaming-reader
```

Then just import `JsonStream` like this:

```typescript
// if you use JavaScript:
const JsonStreamReader = require('json-streaming-reader').JsonStreamReader;

// or if you use TypeScript:
import {JsonStreamReader} from 'json-streaming-reader'
```

And pipe the reading stream to it like this:

```javascript
const jsonStream = new JsonStreamReader();
readStream.pipe(jsonStream);

jsonStream.on('data', (data) => {
    // do something with the record
    // NOTE: `data` is an object with single field `record` that hosts actual value.
    const {record} = data.record;
    
    console.log(record);
});
```