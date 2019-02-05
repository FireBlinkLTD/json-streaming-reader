import { suite, test } from 'mocha-typescript';
import { JsonStreamRecordBuilder } from '../../src/JsonStreamRecordBuilder';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class JsonStreamTestSuite {

    @test()
    async errorOnDone(): Promise<void> {
        const builder = new JsonStreamRecordBuilder();
        builder.onData({ name: 'startObject' });
        builder.onData({ name: 'endObject' });        

        chai.expect(() => {
            builder.onData({ name: 'keyValue', value: 'a' });
        }).to.throw('Unable to process JSON chunk data {"name":"keyValue","value":"a"}. Record is already parsed.');         
    }

    @test()
    async errorOnUnsuportedName(): Promise<void> {
        const builder = new JsonStreamRecordBuilder();
        
        chai.expect(() => {
            builder.onData({ name: 'unknownKey' });
        }).to.throw('Unable to process JSON chunk data {"name":"unknownKey"}. Unsupported name.');         
    }

    @test()
    async errorOnNonRegisteredKey1(): Promise<void> {
        const builder = new JsonStreamRecordBuilder();
        builder.onData({ name: 'startObject' });        

        chai.expect(() => {
            builder.onData({ name: 'numberValue', value: '3' });
        }).to.throw('Unable to process JSON chunk data {"name":"numberValue","value":3}. Unable to assign value for missing key.');
    }

    @test()
    async errorOnNonRegisteredKey2(): Promise<void> {
        const builder = new JsonStreamRecordBuilder();
        builder.onData({ name: 'startObject' });        
        builder.onData({ name: 'startObject' });        
        
        chai.expect(() => {
            builder.onData({ name: 'endObject' });
        }).to.throw('Unable to process JSON chunk data {"name":"endObject"}. Child field key not registered.');
    }
}
