const path=require('path');
const socketIO=require('socket.io');
const http=require('http');
var express=require('express');
const mysql = require('mysql');
let bodyParser=require('body-parser');
var {generateMsg,generateLocationMsg,generateMsgChat}=require('./utils/message');
const {isRealString}=require('./utils/validation.js');
const {Users}=require('./utils/users');
const PublicPath=path.join(__dirname,'../public');
const port=process.env.PORT||3000;
var app=express();
var server=http.createServer(app);
var io=socketIO(server);
var users=new Users();
app.use(express.static(PublicPath));
app.use(bodyParser());
require('./database/db_client')(mysql);

io.on('connection',(socket)=>{
    console.log('New User Connected');
    socket.on('disconnect',()=>{
        var user=users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room));
            io.to(user.room).emit('newMsg',generateMsg('Admin',`${user.name} has left.`));
        }
    })
    socket.on('join',(params,callback)=>{
        if(!isRealString(params.name)|| !isRealString(params.room)){
            callback('Name and room name are required...');
        }
        insertRoom(params.room,(data)=>{
            console.log(data)
            chatUser(data,params.name,(data)=>{
                var ChatRoomId=data;
                insertChatRoomUser(data.roomId,data.userId,(data)=>{
                    getChatsbyRoomId(ChatRoomId,(data)=>{
                    socket.join(params.room);
                    users.removeUser(socket.id);
                    users.addUser(socket.id,params.name,params.room);

                    io.to(params.room).emit('updateUserList',users.getUserList(params.room));

                    // socket.emit('newMsg',generateMsg('admin','Welcome to the chat app..'));
                    socket.broadcast.to(params.room).emit('newMsg',generateMsgChat('Chat Room Join',`${params.name} has joined..`,ChatRoomId.roomId));
                    callback(ChatRoomId,data);
                    });
                })
            });
        })

    })

app.post('/message',(req,res)=>{
        insertMsg(req.body.ChatRoomId,req.body.fromId,req.body.content,(data)=>   {
            io.emit('newMsg',generateMsgChat(req.body.from,req.body.content,req.body.ChatRoomId));

            res.send({status:0});
        });
});
    socket.on('createMsg',(newMsg,callback)=>{
        var user=users.getUser(socket.id);
        if(user && isRealString(newMsg.content)){
            console.log(newMsg);
            insertMsg(newMsg.ChatRoomId,newMsg.fromId,newMsg.content,(data)=>   {
                io.emit('newMsg',generateMsg(newMsg.from,newMsg.content));
            });

        }
       callback();
    })
    socket.on('createLocationMsg',(coords)=>{
        io.emit('newLocationMsg',generateLocationMsg('Admin',coords.latitude,coords.longitude));
    })
});
server.listen(port,()=>{
    console.log(`Server is started on port ${port}..`);
});