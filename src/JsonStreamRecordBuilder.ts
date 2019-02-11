enum NAMES {
    START_OBJECT = 'startObject',
    END_OBJECT = 'endObject',
    
    START_ARRAY = 'startArray',
    END_ARRAY = 'endArray',
    
    KEY_VALUE = 'keyValue',
    STRING_VALUE = 'stringValue',
    NUMBER_VALUE = 'numberValue',
    NULL_VALUE = 'nullValue',
    TRUE_VALUE = 'trueValue',
    FALSE_VALUE = 'falseValue',
}

export class JsonStreamRecordBuilder {
    private record: any;
    private done = false;

    private isArray = false;
    private isObject = false;
    
    private childFieldKey: string | undefined;
    private childFieldValueBuilder: JsonStreamRecordBuilder | undefined;

    private static SUPPORTED_NAMES = Object.keys(NAMES)
        .map(name => NAMES[name as any]);        

    private static END_OBJECT_ARRAY_NAMES: string[] = [
        NAMES.END_OBJECT,
        NAMES.END_ARRAY
    ];

    private static VALUE_NAMES: string[] = [
        NAMES.STRING_VALUE,
        NAMES.NUMBER_VALUE,
        NAMES.NULL_VALUE,
        NAMES.TRUE_VALUE,
        NAMES.FALSE_VALUE
    ];

    /**
     * Purge builder to start accepting new record
     */
    purge() {
        this.record = undefined;
        this.done = false;

        this.isArray = false;
        this.isObject = false;        

        this.childFieldKey = undefined;
        this.childFieldValueBuilder = undefined;
    }

    /**
     * Handle data chunk
     * @param data 
     */
    onData(data: { name: string; value?: any }) {
        if (JsonStreamRecordBuilder.SUPPORTED_NAMES.indexOf(data.name) < 0) {
            throw new Error(`Unable to process JSON chunk data ${JSON.stringify(data)}. Unsupported name.`);
        }

        if (this.done) {
            throw new Error(`Unable to process JSON chunk data ${JSON.stringify(data)}. Record is already parsed.`);
        }

        if (this.childFieldValueBuilder) {
            this.childFieldValueBuilder.onData(data);

            if (this.childFieldValueBuilder.isDone()) {
                if (this.isArray) {
                    this.record.push(this.childFieldValueBuilder.getRecord());
                }

                if (this.isObject) {
                    if (!this.childFieldKey) {
                        throw new Error(`Unable to process JSON chunk data ${JSON.stringify(data)}. Child field key not registered.`);
                    }

                    this.record[this.childFieldKey] = this.childFieldValueBuilder.getRecord();
                }                

                this.childFieldValueBuilder = undefined;
                this.childFieldKey = undefined;
            }

            return;
        }

        if (data.name === NAMES.START_OBJECT) {
            if (!this.record) {
                this.isObject = true;
                this.record = {};
            } else {
                this.childFieldValueBuilder = new JsonStreamRecordBuilder();
                this.childFieldValueBuilder.onData(data);
            }

            return;
        }

        if (data.name === NAMES.START_ARRAY) {
            if (!this.record) {
                this.isArray = true;
                this.record = [];
            } else {
                this.childFieldValueBuilder = new JsonStreamRecordBuilder();
                this.childFieldValueBuilder.onData(data);
            }

            return;
        }

        if (JsonStreamRecordBuilder.END_OBJECT_ARRAY_NAMES.indexOf(data.name) >= 0) {
            this.done = true;

            return;
        }

        if (data.name === NAMES.KEY_VALUE) {
            this.childFieldKey = data.value;

            return;
        }

        /* istanbul ignore else */
        if (JsonStreamRecordBuilder.VALUE_NAMES.indexOf(data.name) >= 0) {
            if (data.name === NAMES.NUMBER_VALUE) {
                data.value = Number(data.value);
            }

            if (this.isArray) {
                this.record.push(data.value);

                return;
            }

            if (this.isObject) {
                if (!this.childFieldKey) {
                    throw new Error(`Unable to process JSON chunk data ${JSON.stringify(data)}. Unable to assign value for missing key.`);
                }
            
                this.record[this.childFieldKey] = data.value;
                this.childFieldKey = undefined;

                return;
            }
           
            this.record = data.value;
            this.done = true;

            return;
        }
    }

    /**
     * Check if record construction is done
     */
    isDone(): boolean {
        return this.done;
    }

    /**
     * Get constructed record
     */
    getRecord(): any {
        return this.record;
    }
}
