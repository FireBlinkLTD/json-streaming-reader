# JSON Streaming Protocol Reader

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

```javascript
import {JsonStream} from 'json-streaming-reader'
```

And pipe the reading stream to it like this:

```javascript
const jsonStream = new JsonStream();
yourStream.pipe(jsonStream);

jsonStream.on('data', (record) => {
    // do something with the record
    console.log(JSON.stringify(record));
});
```