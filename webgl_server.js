var WebSocketServer = require("ws").Server;
// var wss = new WebSocketServer({port:8100});
var wss = new WebSocketServer({address:"175.195.84.133", port:8100});

var connectionList = [];

function UpdateUserInfo() {
    // check user open
    for(var ii = 0; ii < connectionList.length; ++ii) {
        if(connectionList[ii].readyState != connectionList[ii].OPEN) {
            connectionList.splice(ii, 1);
            --ii;
        }
    }

    console.log();
    console.log("current user info : " + connectionList);
    console.log("send Update UserInfo");

    // send userNum
    for(var ii = 0; ii < connectionList.length; ++ii) {
        // console.log(connectionList[ii].readyState);
        if(connectionList[ii].readyState == connectionList[ii].OPEN) {
            var connectionInfo = {code: "userNum", userNum: connectionList.length};
            var data = JSON.stringify(connectionInfo);
            connectionList[ii].send(data);
        }else{
            connectionList.splice(ii, 1);
            --ii;
        }
    }
}

wss.on("connection", function(ws, request) {
    console.log("connected " + ws + ", request " + request);
    connectionList.push(ws);

    ws.on("message", function(msg) {
        console.log();
        console.log("msg[" + msg + "]");
        
        var data;
        //accepting only JSON messages 
        try { 
            data = JSON.parse(msg); 
        } catch (exception) { 
            console.log("Invalid JSON"); 
            data = {}; 
        }

        console.log("data[" + data + "]");
        if("close" == data.code) {
            connectionList.splice(data.id, 1);
            console.log("connectionList[" + connectionList + "]");
            UpdateUserInfo();
        }
        console.log();
    });

    ws.on("close", function(code, reason) {
        console.log("code[" + code + "]" + " reason[" + reason + "]");
        UpdateUserInfo();
    });

    var connectionInfo = {code: "connect", id: connectionList.length - 1, userNum:connectionList.length};
    var data = JSON.stringify(connectionInfo);
    ws.send(data);

    UpdateUserInfo();
});

wss.on("closedconnection", function(id) {
    console.log("disconnected " + id);
});
