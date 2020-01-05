var WebSocketServer = require("ws").Server;
// var wss = new WebSocketServer({port:8100});
var wss = new WebSocketServer({address:"175.195.84.133", port:8100});

var connectionList = [];
var diceList = [];

// user info
function initUserInfo(ws) {
    connectionList.push(ws);
    diceList.push(0);
}

function delUserInfo(nUserIndex) {
    connectionList.splice(nUserIndex, 1);
    diceList.splice(nUserIndex, 1);
}

function displayUserInfo() {
    console.log("connectionList[" + connectionList + "]");
    console.log("diceList[" + diceList + "]");
}

function refreshUserInfo() {
    // check user open
    for(var ii = 0; ii < connectionList.length; ++ii) {
        if(connectionList[ii].readyState != connectionList[ii].OPEN) {
            delUserInfo(ii);
            --ii;
        }
    }
}

function UpdateUserInfo() {
    refreshUserInfo();

    console.log();
    console.log("current user info : " + connectionList);
    console.log("send Update UserInfo");

    // send userNum
    for(var ii = 0; ii < connectionList.length; ++ii) {
        // console.log(connectionList[ii].readyState);
        if(connectionList[ii].readyState == connectionList[ii].OPEN) {
            var connectionInfo = {code: "userNum", userNum: connectionList.length, dice: diceList};
            var data = JSON.stringify(connectionInfo);
            connectionList[ii].send(data);
        }else{
            delUserInfo(ii);
            --ii;
        }
    }
}

function UpdateUserDice(nUserIndex, nUserVar) {
    if(connectionList.length <= nUserIndex) {
        console.log("invalid Dice User Index : " + nUserIndex + ", var : " + nUserVar);
        return;
    }

    if(connectionList[nUserIndex].readyState == connectionList[nUserIndex].OPEN) {
        diceList[nUserIndex] = nUserVar;
    }

    // notice User Dice
    console.log("send User Dice");
    for(var ii = 0; ii < connectionList.length; ++ii) {
        // console.log(connectionList[ii].readyState);
        if(connectionList[ii].readyState == connectionList[ii].OPEN) {
            var diceInfo = {code: "dice", dice: diceList};
            var data = JSON.stringify(diceInfo);
            console.log(data);
            connectionList[ii].send(data);
        }else{
            delUserInfo(ii);
            --ii;
        }
    }
}

wss.on("connection", function(ws, request) {
    console.log("connected " + ws + ", request " + request);
    initUserInfo(ws);

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
            delUserInfo(data.id);
            displayUserInfo();
            UpdateUserInfo();
        }else if("dice" == data.code) {
            UpdateUserDice(data.id, data.dice);
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
