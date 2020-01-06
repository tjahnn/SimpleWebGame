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
    var connectionID = 0;
    var userID = "";
    var userLoggin = false;
    var arUserDice = [0];

    function getUserNum() {
        return nUserNum;
    }

    function addUserPos(nVar) {
        arUserDice[connectionID] += nVar;

        var DiceLimit = gameRule.getTotalGameBoard();
        while(arUserDice[connectionID] >= DiceLimit)
            arUserDice[connectionID] -= DiceLimit;

        // send server
        if(ws.readyState == ws.OPEN) {
            var diceInfo = {code: "dice", id: connectionID, dice: arUserDice[connectionID]};
            var data = JSON.stringify(diceInfo);
            ws.send(data);
        }
    }

    function getUserDice(nUserIndex) {
        if(nUserIndex >= arUserDice.length)
            return 0;
        return arUserDice[nUserIndex];
    }

    function isMyHorses(nII) {
        return nII === connectionID;
    }

    function cleanUpUserInfo() {
        nUserNum = 0;
        connectionID = 0;
        arUserDice = [0];
    }

    function registerServer(id, pw) {
        if(ws.readyState == ws.OPEN) {
            var registerInfo = {code: "register", connectionId: connectionID, id: id, pw: pw};
            var data = JSON.stringify(registerInfo);
            ws.send(data);
        }
    }

    function logginServer(id, pw) {
        if(ws.readyState == ws.OPEN) {
            var logginInfo = {code: "loggin", connectionId: connectionID, id: id, pw: pw};
            var data = JSON.stringify(logginInfo);
            ws.send(data);
        }
    }

    function isLoggin() {
        return userLoggin;
    }

    function logginOper(data) {
        userID = data.id;
        arUserDice = data.dice;
        userLoggin = true;
        document.getElementById("my_name").style.display = "none";
        document.getElementById("my_password").style.display = "none";
        document.getElementById("my_loggin").style.display = "none";
        var logginInfo = document.getElementById("userInfo");
        logginInfo.style.display = "block";
        logginInfo.innerText = "반갑습니다. " + userID + " 님";
    }

    function connectServer() {
        //ws = new WebSocket("ws://localhost:8100");
        ws = new WebSocket("ws://175.195.84.133:8100");

        ws.onopen = function(e){
            //alert("connect server");
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
                connectionID = data.id;
                nUserNum = data.userNum;
                // alert(connectionID + ", " + nUserNum);
                document.getElementById("info").innerHTML = nUserNum;
            }else if("userNum" == data.code) {
                nUserNum = data.userNum;
                arUserDice = data.dice;
                connectionID = data.id;
                if(nUserNum != arUserDice.length)
                    alert("dice error");
                document.getElementById("info").innerHTML = data.userNum;
            }else if("dice" == data.code) {
                connectionID = data.id;
                arUserDice = data.dice;
                //alert("dice update : " + arUserDice);
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
            var connectionInfo = {code: "close", id: connectionID};
            var data = JSON.stringify(connectionInfo);
            ws.send(data);
            ws.close();
        }
    }

    return {
        isLoggin,
        registerServer: registerServer,
        logginServer: logginServer,
        getUserNum: getUserNum,
        addUserPos: addUserPos,
        getUserDice: getUserDice,
        isMyHorses: isMyHorses,
        connectServer: connectServer,
        closeServer: closeServer
    };
}));