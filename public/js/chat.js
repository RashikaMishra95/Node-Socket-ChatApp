var socket=io();

function scrollToBottom() {
    var messages=jQuery('#messages');
    var newMsg=messages.children('li:last-child');
    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMsgHeight=newMsg.innerHeight();
    var lastMsgHeight=newMsg.prev().innerHeight();

    if(scrollTop + clientHeight + newMsgHeight + lastMsgHeight >=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}
socket.on('connect',()=>{
    console.log('connected to the server');
    var params=jQuery.deparam(window.location.search);
    localStorage.setItem('user',JSON.stringify(params))
    socket.emit('join',params,(data,chat,err)=>{
        if(err){
            alert(err);
            window.location.href='/';
        }else{

            if(chat.length>0){
                var template=jQuery('#message-template').html();
                chat.forEach((t)=>{
                var html=Mustache.render(template,{
                    text:t.message,
                    from:t.name,
                    createdAt:t.at,
                    sr:(t.name==JSON.parse(localStorage.getItem('user'))['name'])?true:false
                });
                jQuery('#messages').append(html);
                    scrollToBottom();
                })

            }
            localStorage.setItem('chatRoomId',data.roomId);
            localStorage.setItem('userId',data.userId);
            //console.log(params);
        }
    })
})

socket.on('disconnect',()=>{
    console.log('Disconnected from  the server');
})

socket.on('updateUserList',(users)=>{
    var ol=jQuery('<ol></ol>');

    users.forEach((user)=>{
        ol.append(jQuery('<li></li>').text(user));
    })
    jQuery('#users').html(ol);
})

socket.on('newMsg',(data)=>{
    if(data.ChatRoomId.toString()===localStorage.getItem('chatRoomId')) {
        var formattedTime = moment(data.createdAt).format('h:mm a');
        var template = jQuery('#message-template').html();
        var html = Mustache.render(template, {
            text: data.content,
            from: (data.from == JSON.parse(localStorage.getItem('user'))['name']) ? 'You' : data.from,
            createdAt: formattedTime,
            sr: (data.from == JSON.parse(localStorage.getItem('user'))['name']) ? true : false
        });
        jQuery('#messages').append(html);
        scrollToBottom();
        // console.log('New message Arrived');
        // var formattedTime=moment(data.createdAt).format('h:mm a');
        // var li=jQuery('<li></li>');
        // li.text(`${data.from} ${formattedTime} :-  ${data.content}`);
        // jQuery('#messages').append(li);
    }

})



socket.on('newLocationMsg',(msg)=>{
    var formattedTime=moment(msg.createdAt).format('h:mm a');
    var template=jQuery('#location-message-template').html();
    var html=Mustache.render(template,{
        from:msg.from,
        createdAt:formattedTime,
        url:msg.url
    })
    jQuery('#messages').append(html);
    scrollToBottom();
    // var formattedTime=moment(msg.createdAt).format('h:mm a');
    // var li=jQuery('<li></li>');
    // var a=jQuery('<a target="_blank">My Current Location</a>')
    // li.text(`${msg.from}  ${formattedTime}: `);
    // a.attr('href',msg.url);
    // li.append(a);
    // jQuery('#messages').append(li);
})

jQuery('#message-form').on('submit',(e)=>{

    e.preventDefault();
    $.post("message",{
        from:JSON.parse(localStorage.getItem('user'))["name"],
        content:jQuery('[name=message]').val(),
        fromId:localStorage.getItem('userId'),
        ChatRoomId:localStorage.getItem('chatRoomId')
    }, function(data, status){
        jQuery('[name=message]').val('');
    },"json");
    // socket.emit('createMsg',{
    //     from:JSON.parse(localStorage.getItem('user'))["name"],
    //     content:jQuery('[name=message]').val(),
    //     fromId:localStorage.getItem('userId'),
    //     ChatRoomId:localStorage.getItem('chatRoomId')
    // },()=>{
    //     console.log('message Reached');
    //     jQuery('[name=message]').val('');
    // })
})



var locationButton=jQuery('#send-location');
locationButton.on('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser..');
    }
    locationButton.attr('disabled','disabled');
    navigator.geolocation.getCurrentPosition((pos)=>{
        locationButton.removeAttr('disabled');
        socket.emit('createLocationMsg',{
            longitude:pos.coords.longitude,
            latitude:pos.coords.latitude
        })
    },()=>{
        alert('unable to fetch location');
    })
})


// document.getElementById('message-form').addEventListener('submit',(e)=>{
//     e.preventDefault();
// })