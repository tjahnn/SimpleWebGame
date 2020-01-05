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
                document.getElementById("info").innerHTML = data.userNum;
                
            }
        };

        ws.onclose = function(e){
            alert("onclose : " + e);
        }

        ws.onerror = function(e) {
            alert("error");
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
        connectServer: connectServer,
        closeServer: closeServer
    };
}));