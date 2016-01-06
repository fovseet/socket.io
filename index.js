var app = require('./server/node_modules/express')();
var http = require('http').Server(app);
var io = require('./server/node_modules/socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/day1/index.html');
});

app.get('/socket.io.js',function(req,resp){
    resp.sendFile(__dirname+'/server/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
});

app.get('/jquery-1.11.3.js',function(req,resp){
    resp.sendFile(__dirname+'/client/js/jquery-1.11.3.js')
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});