(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.webglMain = factory.call(root);
    }
  }(this, function() {
    var cameraAngle = 0;
    var cameraView = 0;
    var program;
    var positionLocation;
    var colorLocation;
    var matrixLocation;
    var positionBuffer;
    var colorBuffer;
    var horsesBuffer;
    var horsesBufferMy;
    var horsesColorBuffer;

    function AddCameraAngle(dVal) {
        cameraAngle += dVal;
    }

    function AddCameraView(dVal) {
        cameraView += dVal;
    }

    function drawInit(gl) {
        // setup GLSL program
        program = webglUtils.createProgramFromScripts(gl, [[webglShader.vertextShader, gl.VERTEX_SHADER], [webglShader.fragmentShader, gl.FRAGMENT_SHADER]]);

        // look up where the vertex data needs to go.
        positionLocation = gl.getAttribLocation(program, "a_position");

        // lookup uniforms
        colorLocation = gl.getUniformLocation(program, "u_color");
        matrixLocation = gl.getUniformLocation(program, "u_matrix");

        // Create a buffer to put positions in
        positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        setGeometry(gl);

        // Create a buffer to put colors in
        colorBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // Put geometry data into buffer
        setColors(gl);

        // Create a buffer to put horses in
        horsesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, horsesBuffer);
        setHorses(gl, false);

        horsesBufferMy = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, horsesBufferMy);
        setHorses(gl, true);

        // Create a buffer to put horses color in
        horsesColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, horsesColorBuffer);
        setHorsesColor(gl);

        // buffer function
        function setGeometry(gl) {
            var positions = webglfigure.getDefaultBody();
            var matrix = webglm4.scaling(1, 1, 1);
            var xOffset = webglfigure.nDefaultBoardGap * 0.5;
            for (var ii = 0; ii < positions.length; ii += 3) {
                positions[ii + 0] += xOffset;
                var vector = webglm4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix);
                positions[ii + 0] = vector[0];
                positions[ii + 1] = vector[1];
                positions[ii + 2] = vector[2];
            }
            
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        }
            
        // Fill the buffer with colors for the 'F'.
        function setColors(gl) {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                webglfigure.getDefaultColor(),
                gl.STATIC_DRAW);
        }

        // Fill the buffer with horses
        function setHorses(gl, bMy) {
            if(bMy) {
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    webglfigure.getHorsesBodyMy(),
                    gl.STATIC_DRAW);
            }else {
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    webglfigure.getHorsesBody(),
                    gl.STATIC_DRAW);
            }
        }

        // Fill the buffer with horses color
        function setHorsesColor(gl) {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                webglfigure.getHorsesColor(),
                gl.STATIC_DRAW);
        }
    }

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    
    function degToRad(d) {
        return d * Math.PI / 180;
    }

    function drawGameBoard(viewProjectionMatrix) {
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
        
        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);
        
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);
        
        // Turn on the color attribute
        //gl.enableVertexAttribArray(colorLocation);
        
        // Bind the color buffer.
        //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        
        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        //var size = 3;                 // 3 components per iteration
        //var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        //var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        //var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        //var offset = 0;               // start at the beginning of the buffer
        //gl.vertexAttribPointer(
        //    colorLocation, size, type, normalize, stride, offset);

        // draw game board
        var numFsX = gameRule.nGameSideBoard;
        var numFsY = gameRule.nGameSideBoard;
        var nOffset = webglfigure.nDefaultBoardGap;
        for (var ix = -(numFsX * 0.5); ix < (numFsX * 0.5); ++ix) {
            for (var iy = -(numFsY * 0.5); iy < (numFsY * 0.5); ++iy) {
                // starting with the view projection matrix
                // compute a matrix for the F
                var matrix = webglm4.translate(viewProjectionMatrix, nOffset * ix, 0, nOffset * iy);
                var colorBack = (ix + iy);
                if(0 == (colorBack % 2)) {
                    matrix = webglm4.xRotate(matrix, Math.PI);
                }
                
                // Set the matrix.
                gl.uniformMatrix4fv(matrixLocation, false, matrix);

                // Set color
                if(ix == -(numFsX * 0.5)) {
                    gl.uniform4fv(colorLocation, [1, 0, 0, 1]);
                }else if(ix == (numFsX * 0.5) - 1) {
                    gl.uniform4fv(colorLocation, [0, 1, 0, 1]);
                }else if(iy == -(numFsY * 0.5)) {
                    gl.uniform4fv(colorLocation, [0, 0, 1, 1]);
                }else if(iy == (numFsY * 0.5) - 1) {
                    gl.uniform4fv(colorLocation, [1, 1, 0, 1]);
                }else {
                    gl.uniform4fv(colorLocation, [0.5, 0.5, 0.5, 1]); // mid
                }
    
                // Draw the geometry.
                var primitiveType = gl.TRIANGLES;
                var offset = 0;
                var count = 6 * 6;
                gl.drawArrays(primitiveType, offset, count);
            }
        }
    }

    function drawGameHorses(viewProjectionMatrix, xPos, zPos, vecColor, bMy) {
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
        
        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);
        
        // Bind the position buffer.
        if(bMy) {
            gl.bindBuffer(gl.ARRAY_BUFFER, horsesBufferMy);
        }else {
            gl.bindBuffer(gl.ARRAY_BUFFER, horsesBuffer);
        }
        
        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);
        
        // Turn on the color attribute
        //gl.enableVertexAttribArray(colorLocation);
        
        // Bind the color buffer.
        //gl.bindBuffer(gl.ARRAY_BUFFER, horsesColorBuffer);
        
        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        //var size = 3;                 // 3 components per iteration
        //var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        //var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        //var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        //var offset = 0;               // start at the beginning of the buffer
        //gl.vertexAttribPointer(
        //    colorLocation, size, type, normalize, stride, offset);

        var nOffset = webglfigure.nDefaultBoardGap;
        var nXPos = xPos * nOffset;
        var nYPos = nOffset * 0.5;
        var nZPos = zPos * nOffset;
        var matrix = webglm4.translate(viewProjectionMatrix, -10 + nXPos, nYPos, -20 + nZPos);
            
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // Set color
        gl.uniform4fv(colorLocation, vecColor);

        // Draw the geometry.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 3 * 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    function drawScene() {
        if(!gameUser.isLoggin()) return;

        var cameraAngleRadiansY = degToRad(cameraAngle);
        var cameraAngleRadiansX = degToRad(-45 + cameraView);
        var fieldOfViewRadians = degToRad(60);
        
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);
        
        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);
        
        var radius = 250;
        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = webglm4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
        
        // Compute a matrix for the camera
        var cameraMatrix = webglm4.yRotation(cameraAngleRadiansY);
        cameraMatrix = webglm4.xRotate(cameraMatrix, cameraAngleRadiansX);
        cameraMatrix = webglm4.translate(cameraMatrix, 0, 0, radius * 1.5);
        
        // Make a view matrix from the camera matrix
        var viewMatrix = webglm4.inverse(cameraMatrix);
        
        // Compute a view projection matrix
        var viewProjectionMatrix = webglm4.multiply(projectionMatrix, viewMatrix);

        // draw game board
        drawGameBoard(viewProjectionMatrix);

        // draw game horses
        for(var ii = 0; ii < gameUser.getTeamNum(); ++ii) {
            var teamDice = gameUser.getUserDice(ii);
            var isMy = gameUser.isMyHorses(teamDice.team);
            var userPos = gameRule.getUserPosition(teamDice.dice);
            var vecColor;
            if(isMy) {
                vecColor = [0.5, 0.5, 0, 1];
            }else {
                vecColor = [0.5, 0, 0.5, 1];
            }
            drawGameHorses(viewProjectionMatrix, userPos[0], userPos[1], vecColor, isMy);
        }
    }

    return {
        drawInit: drawInit,
        drawScene: drawScene,
        AddCameraAngle: AddCameraAngle,
        AddCameraView: AddCameraView,
    };
  }));
  