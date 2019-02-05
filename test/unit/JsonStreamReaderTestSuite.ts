import * as assert from 'assert';
import { suite, test } from 'mocha-typescript';
import { JsonStreamReader } from '../../src/JsonStreamReader';
import { JsonStreamRecordBuilder } from '../../src';

class JsonStreamPatched extends JsonStreamReader {
    updateJsonStreamRecordBuilder(builder: JsonStreamRecordBuilder) {
        this.builder = builder;
    }    
}

class JsonStreamRecordBuilderPatched extends JsonStreamRecordBuilder {
    constructor(private errorOnData: Error) {
        super();
    }
    
    onData(data: { name: string; value?: any }) {
        throw this.errorOnData;        
    }
}

@suite()
class JsonStreamReaderTestSuite {
    @test()
    async lineDelimited(): Promise<void> {
        const expected = [
            {
                a: 1,
                b: [
                    1,
                    true,
                    {
                        c: [1, 2, {}, [], null],
                    },
                    null,
                ],
                d: true,
            },
            null,
            123,
            {},
            'str'
        ];

        const stream = new JsonStreamReader();        
        const actual: any[] = [];
        stream.on('data', (streamValue: any) => {
            actual.push(streamValue.record);
        });

        const data: string[] = [];
        for (const record of expected) {
            data.push(JSON.stringify(record));
        }

        await new Promise(res => stream.write(data.join('\n'), res));

        assert.deepStrictEqual(actual, expected);
    }

    @test()
    async concatenated(): Promise<void> {
        const expected = [
            { a: 1 },
            { b: 2 }
        ];

        const stream = new JsonStreamReader();        
        const actual: any[] = [];
        stream.on('data', (streamValue) => {
            actual.push(streamValue.record);
        });

        const data: string[] = [];
        for (const record of expected) {
            data.push(JSON.stringify(record));
        }

        await new Promise(res => stream.write(data.join(''), res));

        assert.deepStrictEqual(actual, expected);
    }

    @test()
    async errorHandling(): Promise<void> {
        const builder = new JsonStreamRecordBuilderPatched(new Error('test'));        
        const stream = new JsonStreamPatched();
        stream.updateJsonStreamRecordBuilder(builder);        

        let error: Error;
        stream.on('error', (err: Error) => {
            error = err;
        });            

        await new Promise(res => stream.write('{}', res));

        assert.strictEqual(error.message, 'test');
    }
}
