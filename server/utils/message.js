var moment=require('moment');

var generateMsg=(from,content)=>{
    return {
        from,
        content,
        createdAt : moment().valueOf(),
    };
};
var generateMsgChat=(from,content,ChatRoomId)=>{
    return {
        from,
        content,
        createdAt : moment().valueOf(),
        ChatRoomId,
    };
};

var generateLocationMsg=(from,latitude,longitude)=>{
    return {
        from,
        url:`http://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt : moment().valueOf()
    };
};

module.exports={
    generateMsg,
    generateLocationMsg,
    generateMsgChat
};