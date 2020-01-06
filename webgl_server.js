var WebSocketServer = require("ws").Server;
var WebServerIp = require("public-ip");
var mongo = require("mongodb");

var public_ip;
var server_port = 8100;
(async()=>{
    public_ip = await WebServerIp.v4();
    console.log("server open ip : " + public_ip + ", port : " + server_port);
})();
// var wss = new WebSocketServer({port:8100});
var wss = new WebSocketServer({address:String(public_ip), port:server_port});

// user info
var RegiseterInfo = [];
var UserInfo = [];
var diceList = [];

// function
function displayUserInfo() {
    console.log("UserInfo");
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        console.log(ii + " [" +
        + UserInfo[ii].userWS.readyState + ", "
        + UserInfo[ii].id + ", "
        + UserInfo[ii].pw + "]");
    }
    console.log("diceList[" + diceList + "]");
}

function initUserInfo(ws) {
    UserInfo.push({userWS: ws, id: "", pw: ""});
    diceList.push(0);
    displayUserInfo();

    if(UserInfo.length != diceList.length) {
        console.log("invalid UserInfo and diceList");
        return -1;
    }
    return UserInfo.length;
}

function delUserInfo(nUserIndex) {
    UserInfo.splice(nUserIndex, 1);
    diceList.splice(nUserIndex, 1);
}

function isConnect(ii) {
    if(UserInfo.length <= ii) {
        console.log("invalid isConnect User Index : " + ii);
        return false;
    }
    return UserInfo[ii].userWS.readyState === UserInfo[ii].userWS.OPEN;
}

function sendUser(ii, data) {
    if(isConnect(ii)) {
        UserInfo[ii].userWS.send(data);
    }
}

function sendConnectInfo(nUserSize) {
    if(-1 == nUserSize) return;

    var connectionInfo = {code: "connect", id: nUserSize - 1, userNum: nUserSize};
    var data = JSON.stringify(connectionInfo);
    sendUser(connectionInfo.id, data);
}

function refreshUserInfo() {
    // check user open
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        if(!isConnect(ii)) {
            delUserInfo(ii);
            --ii;
        }
    }
}

function UpdateUserInfo() {
    refreshUserInfo();

    console.log();
    displayUserInfo();

    console.log("send Update UserInfo");
    // send userNum
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        // console.log(connectionList[ii].readyState);
        if(isConnect(ii)) {
            var connectionInfo = {code: "userNum", id: ii, userNum: UserInfo.length, dice: diceList};
            var data = JSON.stringify(connectionInfo);
            sendUser(ii, data);
        }else{
            delUserInfo(ii);
            --ii;
        }
    }
}

function UpdateUserDice(nUserIndex, nUserVar) {
    if(isConnect(nUserIndex)) {
        diceList[nUserIndex] = nUserVar;
    }

    // notice User Dice
    console.log("send User Dice");
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        // console.log(connectionList[ii].readyState);
        if(isConnect(ii)) {
            var diceInfo = {code: "dice", id: ii, dice: diceList};
            var data = JSON.stringify(diceInfo);
            console.log(data);
            sendUser(ii, data);
        }else{
            delUserInfo(ii);
            --ii;
        }
    }
}

function RegisterUser(nUserIndex, Userid, Userpw) {
    if(!isConnect(nUserIndex)) return;

    RegiseterInfo.push({id: Userid, pw: Userpw})

    for(var ii = 0; ii < RegiseterInfo.length; ++ii) {
        console.log(ii + " [" +
        + RegiseterInfo[ii].id + ", "
        + RegiseterInfo[ii].pw + "]");
    }
}

function isRegisterUser(id, pw) {
    var bRet = false;
    for(var ii = 0; ii < RegiseterInfo.length; ++ii) {
        if(RegiseterInfo[ii].id == id && RegiseterInfo[ii].pw == pw) {
            bRet = true;
            break;
        }
    }

    return bRet;
}

function CheckUserLoggin(nUserIndex, id, pw) {
    if(isConnect(nUserIndex)) {
        if(isRegisterUser(id, pw)) {
            // check loggin db
            UserInfo[nUserIndex].id = id;
            UserInfo[nUserIndex].pw = pw;

            // display user info
            displayUserInfo();

            // send user loggin
            var logginInfo = {code: "loggin", id: id, dice: diceList};
            var data = JSON.stringify(logginInfo);
            sendUser(nUserIndex, data);
        }else {
            console.log("not user info : id(" + id + "), pw(" + pw + ")");
        }
    }else {
        console.log("connected loss " + nUserIndex);
    }
}

wss.on("connection", function(ws, request) {
    console.log("connected " + ws + ", request " + request);

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

        // console.log("data[" + data + "]");
        if("register" == data.code) {
            RegisterUser(data.connectionId, data.id, data.pw)
        }else if("loggin" == data.code) {
            CheckUserLoggin(data.connectionId, data.id, data.pw);
            UpdateUserInfo();
        }else if("close" == data.code) {
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

    var nUserSize = initUserInfo(ws);
    sendConnectInfo(nUserSize);
});

wss.on("closedconnection", function(id) {
    console.log("disconnected " + id);
});
