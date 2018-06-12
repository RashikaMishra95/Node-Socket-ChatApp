var expect=require('expect');
var {generateMsg,generateLocationMsg}=require('./message');
describe('generateMsg',()=>{
    it('should generate a correct message...',()=>{
        var from='Rashika';
        var content='Hello';
        var message=generateMsg(from,content);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,content});
    })
})

describe('generateLocationMsg',()=>{
    it('should generate a correct url for location..',()=>{
        var from='Rashika';
        var lat=564;
        var long=435;
        var url='https://www.google.com/maps?q=564,435';
        var message=generateLocationMsg(from,lat,long);
        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,url});
    })
})