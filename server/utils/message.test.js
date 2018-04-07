var expect=require('expect');
var {generateMsg,generateLocationMsg}=require('./message');
describe('generateMsg',()=>{
    it('should generate a correct message...',()=>{
        var from='Deeksha';
        var content='What r u doing';
        var message=generateMsg(from,content);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,content});
    })
})

describe('generateLocationMsg',()=>{
    it('should generate a correct url for location..',()=>{
        var from='Deeksha';
        var lat=564;
        var long=435;
        var url='https://www.google.com/maps?q=564,435';
        var message=generateLocationMsg(from,lat,long);
        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,url});
    })
})