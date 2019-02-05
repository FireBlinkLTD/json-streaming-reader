import {Transform, TransformCallback} from 'stream';
import * as StreamJson from 'stream-json';

import { JsonStreamRecordBuilder } from './JsonStreamRecordBuilder';

export class JsonStreamReader extends Transform {
    protected parser: StreamJson.Parser;
    protected builder: JsonStreamRecordBuilder; 

    constructor() {
        super({
            writableObjectMode: false, 
            readableObjectMode: true
        });

        this.builder = new JsonStreamRecordBuilder();

        this.parser = StreamJson({
            jsonStreaming: true,
            streamKeys: false,
            streamNumbers: false,
            streamStrings: false,
            streamValues: false,
        });

        this.parser.on('data', (chunk: any) => {
            try {
                this.builder.onData(chunk);
            } catch (e) {
                this.push(null); // stop stream
                this.emit('error', e);                
                
                return;
            }

            if (this.builder.isDone()) {   
                const record = this.builder.getRecord();
                this.builder.purge();

                // push record to stream
                this.push({record});
            }
        });
    }    

    _transform(chunk: any, encoding: string, callback: TransformCallback): void {
        this.parser._transform(chunk, encoding, callback);
    }
}
