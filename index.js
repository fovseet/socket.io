var express = require('./server/node_modules/express');
var logger = require('./server/node_modules/morgan');
var app = express();
var http = require('http').Server(app);
var io = require('./server/node_modules/socket.io')(http);

app.set("port",3000);

/*使用模块*/
app.use(logger("dev"));
app.use(express.static(__dirname+'/client')); //根目录
/*使用模块*/

app.get('/socket.io.js',function(req,resp){
    resp.sendFile(__dirname+'/server/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
});

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});


//io.on('connection', function(socket){
//    socket.emit('open');    //has conected
//    // 打印握手信息
//    console.log(socket.handshake);
//    // 构造客户端对象
//    var client = {
//        socket:socket,
//        name:false,
//        color:getColor()
//    };
//    // 对message事件的监听
//    socket.on('chat message', function(msg){
//        var obj = {time:getTime(),color:client.color};
//        // 判断是不是第一次连接，以第一条消息作为用户名
//        if(!client.name){
//            client.name = msg;
//            obj['text']=client.name;
//            obj['author']='System';
//            obj['type']='welcome';
//            console.log(client.name + ' login');
//            //返回欢迎语
//            socket.emit('system',obj);
//            //广播新用户已登陆
//            socket.broadcast.emit('system',obj);
//        }else{
//            //如果不是第一次的连接，正常的聊天消息
//            obj['text']=msg;
//            obj['author']=client.name;
//            obj['type']='message';
//            console.log(client.name + ' say: ' + msg);
//
//            // 返回消息（可以省略）
//            socket.emit('message',obj);
//            // 广播向其他用户发消息
//            socket.broadcast.emit('message',obj);
//        }
//        //io.emit('chat message', msg);
//    });
//    //监听出退事件
//    socket.on('disconnect', function () {
//        var obj = {
//            time:getTime(),
//            color:client.color,
//            author:'System',
//            text:client.name,
//            type:'disconnect'
//        };
//
//        // 广播用户已退出
//        socket.broadcast.emit('system',obj);
//        console.log(client.name + 'Disconnect');
//    });
//});
//
http.listen(3000, function(){
    console.log('listening on *:3000');
});
//
//var getColor=function(){
//    var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
//        'orange','blue','blueviolet','brown','burlywood','cadetblue'];
//    return colors[Math.round(Math.random() * 10000 % colors.length)];
//};
//
//var getTime=function(){
//    var date = new Date();
//    return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
//};