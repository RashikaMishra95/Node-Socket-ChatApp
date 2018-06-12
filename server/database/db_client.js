module.exports = function (mysql) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: 'db_chat'
    });
    this.insertRoom = (room, callback) => {
        con.query('select count(id) as c,id from chatroomname where name like "' + room + '"', (err, result) => {
            if (err) throw err;
            if (result[0]["c"] == 0) {
                con.query('INSERT INTO `chatroomname` (`id`, `name`) VALUES (NULL, "' + room + '");', (err, result) => {
                    if (err) throw err;
                    callback(result.insertId)
                });
            }
            else {
                callback(result[0]["id"]);
            }
        });

    }
    this.chatUser = (chatroomId, userName, callback) => {
        con.query('select count(id) as c,id from chatuser where name like "' + userName + '"', (err, result) => {
            if (result[0]["c"] == 0) {
                con.query('INSERT INTO `chatuser` (`id`, `name`) VALUES (NULL, "' + userName + '");', (err, result) => {
                    if (err) throw err;
                    callback({roomId: chatroomId, userId: result.insertId})
                });
            }
            else {
                callback({roomId: chatroomId, userId: result[0]["id"]})
            }
        });

    }
    this.insertChatRoomUser = (roomId, userId, callback) => {
        con.query('select count(id) as c,id from chatroomusers where chatUserId = ' + userId + ' and chatRoomNameId=' + roomId, (err, result) => {
            if (result[0]["c"] == 0) {
                con.query('INSERT INTO `chatroomusers` (`id`, `chatRoomNameId`, `chatUserId`) VALUES (NULL, ' + roomId + ', ' + userId + ');', (err, result) => {
                    if (err) throw err;
                    callback(result.insertId)
                });
            } else {
                callback(result[0]["id"])
            }
        });
    }
    this.insertMsg = (roomId, userId, message, callback) => {

        con.query('INSERT INTO `message` (`id`, `chatRoomId`, `fromId`, `message`, `at`)' +
            ' VALUES (NULL, '+roomId+', '+userId+', "'+message+'", CURRENT_TIMESTAMP);', (err, result) => {
            if (err) throw err;
            callback(result.insertId)
        });

    }
    this.getChatsbyRoomId = (roomId ,callback) => {
        con.query('SELECT m.fromId,cu.name,message,DATE_FORMAT(at,"%h:%i %p") as at FROM `message` as m LEFT JOIN chatuser as cu on m.fromId=cu.id where' +
            ' chatRoomId='+roomId.roomId+'  ORDER BY `m`.`at`  ASC', (err, result) => {
            callback(result);
        });
    }
}