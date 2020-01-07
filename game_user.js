(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.gameUser = factory.call(root);
    }
  }(this, function() {
    var nUserNum = 0;
    var ws;
    var userID = "";
    var userLoggin = false;
    var userTeam = "";
    var userTeamScore = 0;
    var arUserDice = [];
    var bIsManager = false;

    function getTeamNum() {
        return arUserDice.length;
    }

    function getUserDice(nUserIndex) {
        if(nUserIndex >= arUserDice.length)
            return 0;
        return arUserDice[nUserIndex];
    }

    function isMyHorses(teamName) {
        return teamName === userTeam;
    }

    function cleanUpUserInfo() {
        nUserNum = 0;
        arUserDice = [];
    }

    function isLoggin() {
        return userLoggin;
    }

    function sendServer(data) {
        if(userLoggin) {
            ws.send(data);
        }
    }

    function registerServer(id, pw) {
        if(ws.readyState == ws.OPEN) {
            var registerInfo = {code: "register", id: id, pw: pw};
            var data = JSON.stringify(registerInfo);
            ws.send(data);
        }
    }

    function logginServer(id, pw) {
        if(ws.readyState == ws.OPEN) {
            var logginInfo = {code: "loggin", id: id, pw: pw};
            var data = JSON.stringify(logginInfo);
            ws.send(data);
        }
    }

    function registerTeam(name) {
        if(ws.readyState == ws.OPEN) {
            var TeamInfo = {code: "registerTeam", name: name, id: userID};
            var data = JSON.stringify(TeamInfo);
            ws.send(data);
        }
    }

    function applyTeamDiceChance(teamName, teamDiceNum) {
        if(ws.readyState == ws.OPEN) {
            var ChanceInfo = {code: "teamDiceChance", id: userID, name: teamName, chance: teamDiceNum};
            var data = JSON.stringify(ChanceInfo);
            ws.send(data);
        }
    }

    function addUserPos(nVar) {
        if(ws.readyState != ws.OPEN) {
            alert("서버와 연결이 끊어졌습니다.");
            return;
        }
        
        if("" == userTeam) {
            alert("팀에 소속되어야 주사위를 굴릴 수 있습니다.");
            return;
        }

        for(var ii = 0; ii < arUserDice.length; ++ii) {
            if(arUserDice[ii].team == userTeam) {                
                arUserDice[ii].dice += nVar;

                var DiceLimit = gameRule.getTotalGameBoard();
                while(arUserDice[ii].dice >= DiceLimit) {
                    arUserDice[ii].dice -= DiceLimit;
                }

                var score = gameRule.getScoreByPos(arUserDice[ii].dice);
                //alert(nVar + ", " + score);

                var diceInfo = {code: "dice", id: userID, team: userTeam, dice: arUserDice[ii].dice, score:score};
                var data = JSON.stringify(diceInfo);
                sendServer(data);
            }
        }
    }

    function getTotalInfo() {
        if(ws.readyState == ws.OPEN) {
            var totalInfo = {code: "totalInfo"};
            var data = JSON.stringify(totalInfo);
            ws.send(data);
        }
    }

    function logginOper(data) {
        userID = data.id;
        userLoggin = true;
        document.getElementById("my_name").style.display = "none";
        document.getElementById("my_password").style.display = "none";
        document.getElementById("my_loggin").style.display = "none";
        document.getElementById("game_goto_main").style.display = "none";
        var logginInfo = document.getElementById("userInfo");
        logginInfo.style.display = "block";
        logginInfo.innerText = "반갑습니다. " + userID + " 님";
        document.getElementById("dice").style.display = "block";
        if("" != data.team) {
            var teamInfo = document.getElementById("team");
            teamInfo.style.display = "block";
            teamInfo.innerText = data.team;
            userTeam = data.team;

            var teamScore = document.getElementById("team_score");
            teamScore.style.display = "block";
            teamScore.innerText = "0";
            userTeamScore = 0;
        }else {
            document.getElementById("my_teamname").style.display = "block";
            document.getElementById("my_teamregist").style.display = "block";
        }
    }

    function teamOper(data) {
        document.getElementById("my_teamname").style.display = "none";
        document.getElementById("my_teamregist").style.display = "none";
        var teamInfo = document.getElementById("team");
        teamInfo.style.display = "block";
        teamInfo.innerText = data.name;
        userTeam = data.team;
    }

    function connectServer() {
        //ws = new WebSocket("ws://localhost:8100");
        ws = new WebSocket("ws://175.195.84.133:8100");

        ws.onopen = function(e){
            alert("connect server");
        };

        ws.onmessage = function(e){
            var data; 

            //accepting only JSON messages 
            try { 
                data = JSON.parse(e.data); 
            } catch (exception) { 
                alert("Invalid JSON"); 
                data = {}; 
            }

            if("loggin" == data.code) {
                logginOper(data);
            }else if("connect" == data.code) {
                nUserNum = data.userNum;
                //document.getElementById("info").innerHTML = nUserNum;
            }else if("userNum" == data.code) {
                nUserNum = data.userNum;
                //document.getElementById("info").innerHTML = data.userNum;
            }else if("dice" == data.code) {
                arUserDice = data.dice;
                arUserDice.forEach(function(teamInfo) {
                    if(userTeam == teamInfo.team) {
                        userTeamScore = teamInfo.score;
                        document.getElementById("team_score").innerText = userTeamScore;
                    }
                });
                //alert("dice update : " + arUserDice);
            }else if("register" == data.code) {
                if(data.result) {
                    alert("가입 성공");
                }else {
                    alert("가입 실패");
                }
            }else if("registerTeam" == data.code) {
                if(data.result) {
                    alert("팀 생성 성공");
                    teamOper(data);
                }else {
                    alert("팀 생성 실패");
                }
            }else if("totalInfo" == data.code) {
                strVar = "<ul>";
                data.teams.forEach(function(team) {
                    strVar = strVar + "<li>TEAM : " + team._id + " dice : " + team.dice + " score : " + team.score;
                    data.users.forEach(function(user) {
                        if(user.team == team._id) {
                            strVar = strVar + "<li>USER : " + user._id + " team : " + user.team;
                        }
                    });
                });
                strVar = strVar + "<li>";
                data.users.forEach(function(user) {
                    if("" == user.team) {
                        strVar = strVar + "<li>USER : " + user._id + " team : " + user.team;
                    }
                });
                strVar = strVar + "</ul>";
                var scroeInfo = document.getElementById("score");
                scroeInfo.style.display = "block";
                scroeInfo.innerHTML = strVar;
            }else if("manager" == data.code) {
                bIsManager = data.manager;
                document.getElementById("team_dice_name").style.display = "block";
                document.getElementById("team_dice_num").style.display = "block";
                document.getElementById("team_dice_apply").style.display = "block";
            }

            webglMain.drawScene();
        };

        ws.onclose = function(e){
            alert("onclose : " + e);
            cleanUpUserInfo();
            webglMain.drawScene();
        }

        ws.onerror = function(e) {
            alert("error");
            cleanUpUserInfo();
            webglMain.drawScene();
        }
    }

    function closeServer() {
        if(ws.readyState == ws.OPEN) {
            var connectionInfo = {code: "close"};
            var data = JSON.stringify(connectionInfo);
            sendServer(data);
            ws.close();
        }
    }

    return {
        isLoggin,
        getTotalInfo: getTotalInfo,
        registerServer: registerServer,
        logginServer: logginServer,
        applyTeamDiceChance: applyTeamDiceChance,
        registerTeam: registerTeam,
        getTeamNum: getTeamNum,
        addUserPos: addUserPos,
        getUserDice: getUserDice,
        isMyHorses: isMyHorses,
        connectServer: connectServer,
        closeServer: closeServer
    };
}));