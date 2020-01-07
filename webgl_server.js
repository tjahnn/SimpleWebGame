var WebSocketServer = require("ws").Server;
var WebServerIp = require("public-ip");
var MongoClient = require("mongodb").MongoClient;

//mongodb configs
var connectionUrl = "mongodb://localhost:27017/",
    cadDB = "CadDB",
    userCollection = "Users", // id(key), pw, team
    teamCollection = "Teams"; // id(key), dice, score

var public_ip;
var server_port = 8100;
(async()=>{
    public_ip = await WebServerIp.v4();
    console.log("server open ip : " + public_ip + ", port : " + server_port);
})();

// var wss = new WebSocketServer({port:8100});
var wss = new WebSocketServer({address:String(public_ip), port:server_port});

// user info
var UserInfo = []; // { ws, id, team }
var teamChance = [];
var managerId = ["phj0319", "atj1126"];

// function
function displayUserInfo() {
    console.log("UserInfo");
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        console.log(ii + " [" +
        + UserInfo[ii].userWS.readyState + ", "
        + UserInfo[ii].id + ", "
        + UserInfo[ii].team + "]");
    }
    console.log("teamChance");
    console.log(teamChance);
}

function applyTeamChance(id, name, chance) {
    var bIsManager = false;
    managerId.forEach(function(manId) {
        if(manId == id) {
            bIsManager = true;
        }
    });

    if(bIsManager) {
        var bisExist = false;
        teamChance.forEach(function(teamInfo) {
            if(teamInfo.team == name) {
                teamInfo.chance = parseInt(chance);
                bisExist = true;
            }
        });

        if(!bisExist) {
            teamChance.push({team:name, chance:parseInt(chance)});
        }
    }
    console.log("teamChance");
    console.log(teamChance);
}

function getUserInfo(ws) {
    var retVar;
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        if(UserInfo[ii].userWS == ws) {
            retVar = UserInfo[ii];
        }
    }
    return retVar;
}

function getUserIndex(ws) {
    var retVar;
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        if(UserInfo[ii].userWS == ws) {
            retVar = ii;
        }
    }
    return retVar;
}

function initUserInfo(ws) {
    UserInfo.push({userWS: ws, id: "", team: ""});
    displayUserInfo();
}

function delUserInfo(nUserIndex) {
    UserInfo.splice(nUserIndex, 1);
}

function isConnect(ws) {
    return ws.readyState === ws.OPEN;
}

function sendUser(ws, data) {
    if(isConnect(ws)) {
        ws.send(data);
    }
}

function sendConnectInfo(ws) {
    var connectionInfo = {code: "connect", userNum: UserInfo.length};
    var data = JSON.stringify(connectionInfo);
    sendUser(ws, data);
}

function refreshUserInfo() {
    // check user open
    for(var ii = 0; ii < UserInfo.length; ++ii) {
        if(!isConnect(UserInfo[ii].userWS)) {
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
        if(isConnect(UserInfo[ii].userWS)) {
            var connectionInfo = {code: "userNum", userNum: UserInfo.length};
            var data = JSON.stringify(connectionInfo);
            sendUser(UserInfo[ii].userWS, data);
        }else{
            delUserInfo(ii);
            --ii;
        }
    }

    getTeamDice();
}

function UpdateUserDice(ws, id, team, nUserVar, score) {
    if(isConnect(ws)) {
        // update dice
        var curUser = getUserInfo(ws);
        if(curUser.id == id && curUser.team == team) {
            MongoClient.connect(connectionUrl, function(err, client) {
                console.log("Connected correctly to DB server : UpdateUserDice");
            
                if (err) {
                    console.log(err);
                    return;
                }

                console.log("teamChance before");
                console.log(teamChance);

                // check chance
                var nChanceNum = 0;
                teamChance.forEach(function(teamInfo) {
                    if(teamInfo.team == team) {
                        nChanceNum = Number(teamInfo.chance);
                    }
                });

                console.log(team + " chance is " + nChanceNum);
                if(0 >= nChanceNum) {
                    return;
                }

                teamChance.forEach(function(teamInfo) {
                    if(teamInfo.team == team) {
                        teamInfo.chance = (nChanceNum - 1);
                    }
                });

                console.log("teamChance after");
                console.log(teamChance);

                updateKey = {_id: team};
                updateVar = { $set: { dice: nUserVar }, $inc: { score: score } };
        
                var MongoDb = client.db(cadDB)
                var collec = MongoDb.collection(teamCollection);
                collec.updateMany(updateKey, updateVar, function(error,result){
                    //here result will contain an array of records inserted
                    if(!error) {
                        console.log("Success : teamCollection dice update!");
                    } else {
                        console.log("teamCollection dice Some error was encountered!");
                    }
                });
            
                client.close()
            });
        }
    }

    getTeamDice();
}

function RegisterUser(nUserIndex, Userid, Userpw) {
    if(!isConnect(nUserIndex)) return;

    // add register user info
    MongoClient.connect(connectionUrl, function(err, client) {
        console.log("Connected correctly to DB server");
    
        if (err) {
            console.log("err");
            return;
        }

        // Insert Data
        data = {
            _id: Userid,
            pw: Userpw,
            team: ""
        };
    
        // Get some collection
        var MongoDb = client.db(cadDB)
        var collec = MongoDb.collection(userCollection);
        collec.insertOne(data,function(error,result){
            //here result will contain an array of records inserted
            var registerInfo;
            if(!error) {
                console.log("Success :"+result.ops.length+" UserCollection inserted!");
                registerInfo = {code: "register", result: true};
            } else {
                console.log("UserCollection Some error was encountered!");
                registerInfo = {code: "register", result: false};
            }
            var data = JSON.stringify(registerInfo);
            sendUser(nUserIndex, data);
        });
    
        client.close()
    });
}

function isRegisterUser(ws, userId, userPw) {
    var bRet = false;

    // add register user info
    MongoClient.connect(connectionUrl, function(err, client) {
        console.log("Connected correctly to DB server");
    
        if (err) {
            console.log(err);
            return;
        }

        // Get some collection
        var MongoDb = client.db(cadDB)
        var collec = MongoDb.collection(userCollection);
        var query = { _id:  userId};
        collec.find(query).toArray(function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
            if(1 != result.length) return;

            console.log(result);
            if(result[0]._id == userId && result[0].pw == userPw) {
                if(isConnect(ws)) {
                    console.log("send user loggin");
                    // check loggin db
                    UserInfo[getUserIndex(ws)].id = result[0]._id;
                    UserInfo[getUserIndex(ws)].team = result[0].team;
        
                    // display user info
                    displayUserInfo();
        
                    // send user loggin
                    var logginInfo = {code: "loggin", id: result[0]._id, team: result[0].team};
                    var data = JSON.stringify(logginInfo);
                    sendUser(ws, data);

                    // check manager
                    managerId.forEach(function(manId) {
                        if(manId == result[0]._id) {
                            var manageInfo = {code: "manager", manager: true};
                            var data = JSON.stringify(manageInfo);
                            sendUser(ws, data);
                        }
                    });

                    getTeamDice();
                }
                bRet = true;
            }
        });
    
        client.close()
    });

    return bRet;
}

function RegisterTeam(ii, teamName, userId) {
    // add register user info
    MongoClient.connect(connectionUrl, function(err, client) {
        console.log("Connected correctly to DB server");
    
        if (err) {
            console.log(err);
            return;
        }

        // Insert Data
        data = {
            _id: teamName,
            dice: 0,
            score: 0
        };
    
        // Get some collection
        var MongoDb = client.db(cadDB)
        var teamcollec = MongoDb.collection(teamCollection);
        teamcollec.insertOne(data,function(error,result){
            //here result will contain an array of records inserted
            if(!error) {
                console.log("Success :"+result.ops.length+" teamCollection inserted!");
            } else {
                console.log("teamCollection Some error was encountered!");
            }
        });

        updateKey = {_id: userId};
        updateVar = { $set: { team: teamName } };

        var usercollec = MongoDb.collection(userCollection);
        usercollec.updateOne(updateKey, updateVar, function(error,result){
            //here result will contain an array of records inserted
            var registerInfo;
            if(!error) {
                console.log("Success : UserCollection update!");
                registerInfo = {code: "registerTeam", result: true, name: teamName};
            } else {
                console.log("UserCollection Some error was encountered!");
                registerInfo = {code: "registerTeam", result: false, name: teamName};
            }
            var data = JSON.stringify(registerInfo);
            sendUser(ii, data);
        });
    
        client.close()
    });
}

function AddTeamUser(teamName, UserId) {

}

function getTeamDice() {
    // add register user info
    MongoClient.connect(connectionUrl, function(err, client) {
        console.log("Connected correctly to DB server");
    
        if (err) {
            console.log(err);
            return;
        }

        // Get some collection
        var MongoDb = client.db(cadDB)
        var collec = MongoDb.collection(teamCollection);
        collec.find().toArray(function(err, result) {
            if (err) {
                console.log(err);
                return;
            }

            var arRet = [];
            for(var ii = 0; ii < result.length; ++ii ) {
                arRet.push({team: result[ii]._id, dice: result[ii].dice, score: result[ii].score});
            }
            console.log(arRet);

            // notice User Dice
            console.log("send User Dice");
            for(var ii = 0; ii < UserInfo.length; ++ii) {
                // console.log(connectionList[ii].readyState);
                if(isConnect(UserInfo[ii].userWS)) {
                    var diceInfo = {code: "dice", dice: arRet};
                    var data = JSON.stringify(diceInfo);
                    sendUser(UserInfo[ii].userWS, data);
                }else{
                    delUserInfo(ii);
                    --ii;
                }
            }
        });
    
        client.close()
    });
}

function getTotalInfo(ws) {
    if(!isConnect(ws)) {
        return;
    }

    // add register user info
    MongoClient.connect(connectionUrl, function(err, client) {
        console.log("Connected correctly to DB server : getTotalInfo");
    
        if (err) {
            console.log(err);
            return;
        }

        var restInfo = []

        // Get User Info
        var MongoDb = client.db(cadDB)
        var collecUser = MongoDb.collection(userCollection);

        var totalUsers = [];
        (async()=>{
            var proUsers = await collecUser.find().toArray();
            console.log("totalInfo User");
            proUsers.forEach(function(user) {
                totalUsers.push(user);
            });
        })();

        // Get Team Info
        var collecTeam = MongoDb.collection(teamCollection);

        var totalTeam = [];
        (async()=>{
            var proTeams = await collecTeam.find().toArray();
            console.log("totalInfo Team");
            proTeams.forEach(function(team) {
                totalTeam.push(team);
            });

            console.log("Send to totalInfo");
            var totalInfo = {code: "totalInfo", users: totalUsers, teams: totalTeam};
            console.log(totalInfo.users);
            console.log(totalInfo.teams);
            var data = JSON.stringify(totalInfo);
            sendUser(ws, data);
        })();
    
        client.close()
    });
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
            RegisterUser(ws, data.id, data.pw)
        }else if("loggin" == data.code) {
            isRegisterUser(ws, data.id, data.pw);
            UpdateUserInfo();
        }else if("close" == data.code) {
            delUserInfo(ws);
            displayUserInfo();
            UpdateUserInfo();
        }else if("dice" == data.code) {
            UpdateUserDice(ws, data.id, data.team, data.dice, data.score);
        }else if("registerTeam" == data.code) {
            RegisterTeam(ws, data.name, data.id);
        }else if("totalInfo" == data.code) {
            getTotalInfo(ws);
        }else if("teamDiceChance" == data.code) {
            applyTeamChance(data.id, data.name, data.chance);
        }
        console.log();
    });

    ws.on("close", function(code, reason) {
        console.log("code[" + code + "]" + " reason[" + reason + "]");
        UpdateUserInfo();
    });

    initUserInfo(ws);
    sendConnectInfo(ws);
    UpdateUserInfo();
});

wss.on("closedconnection", function(id) {
    console.log("disconnected " + id);
});
