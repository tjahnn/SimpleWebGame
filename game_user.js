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
    var arUserDice = [0];

    function getUserNum() {
        return nUserNum;
    }

    function addUserPos(nVar) {
        arUserDice[connectionID] += nVar;

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

    function connectServer() {
        //ws = new WebSocket("ws://localhost:8100");
        ws = new WebSocket("ws://175.195.84.133:8100");

        ws.onopen = function(e){
            alert("open");
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

            if("connect" == data.code) {
                connectionID = data.id;
                nUserNum = data.userNum;
                // alert(connectionID + ", " + nUserNum);
                document.getElementById("info").innerHTML = nUserNum;
            }else if("userNum" == data.code) {
                nUserNum = data.userNum;
                arUserDice = data.dice;
                if(nUserNum != arUserDice.length)
                    alert("dice error");
                document.getElementById("info").innerHTML = data.userNum;
            }else if("dice" == data.code) {
                arUserDice = data.dice;
                alert("dice update : " + arUserDice);
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
        getUserNum: getUserNum,
        addUserPos: addUserPos,
        getUserDice: getUserDice,
        isMyHorses: isMyHorses,
        connectServer: connectServer,
        closeServer: closeServer
    };
}));