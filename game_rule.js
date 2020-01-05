(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.gameRule = factory.call(root);
    }
  }(this, function() {
    /*
        GameBoard
        *****
        *   *
        *   *
        *   *
        *****
        0  1  2  3  4  5  6  7  8
        9  10 11 12 13 14 15 16 17
        18 19 20 21 22 23 24 25 26
        27 28 29 30 31 32 33 34 35
    */
    var nGameSideBoard = 10;
    var nTotalGameBoard = (nGameSideBoard * 2) + ((nGameSideBoard - 2) * 2);
    var nGameEndPoint = [0, nTotalGameBoard - 1];
    var nGameTerningPoint = [
            0,
            nGameSideBoard - 1,
            (nGameSideBoard - 1) * 2, 
            (nGameSideBoard - 1) * 3];
    
    var nUserPos = 0;

    function getUserPos() {
        return nUserPos;
    }

    function addUserPos(nVar) {
        nUserPos += nVar;
    }

    function getPrevTerningPoint(nPos) {
        var nTPIndex = 0;
        var nGap = 0;
        for(var ii = 0; ii < nGameTerningPoint.length; ++ii) {
            if( nPos <= nGameTerningPoint[ii] )
                break;
            nTPIndex = ii;
            nGap = nPos - nGameTerningPoint[ii];
        }

        var basePos = [0, 0];
        if(0 == nTPIndex) {
            basePos[0] = 5;
            basePos[1] = 5 - nGap;
        }else if(1 == nTPIndex) {
            basePos[0] = 5 - nGap;
            basePos[1] = -4;
        }else if(2 == nTPIndex) {
            basePos[0] = -4;
            basePos[1] = -4 + nGap;
        }else if(3 == nTPIndex) {
            basePos[0] = -4 + nGap;
            basePos[1] = 5;
        }

        return basePos;
    }
    
    function getUserPosition() {
        while(nUserPos >= nTotalGameBoard)
            nUserPos -= nTotalGameBoard;

        return getPrevTerningPoint(nUserPos);
    }
    
    return {
        nGameSideBoard: nGameSideBoard,
        getUserPosition: getUserPosition,
        getUserPos: getUserPos,
        addUserPos: addUserPos,
    };
  }));
  