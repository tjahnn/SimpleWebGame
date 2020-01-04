(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.webglfigure = factory.call(root);
    }
  }(this, function() {
    nDefaultBoardGap = 20;
    nDefaultHorsesGap = 10;

    function getDefaultBody() {
      return new Float32Array([
        // front
        -10,  -10,  10,
        10,   -10,  10,
        -10,  10,   10,
        -10,  10,   10,
        10,   -10,  10,
        10,   10,   10,

        // left
        -10,  -10,  -10,
        -10,  -10,  10,
        -10,  10,  -10,
        -10,  -10,  10,
        -10,  10,  10,
        -10,  10,  -10,

        // right
        10,  -10,  -10,
        10,  10,  -10,
        10,  -10,  10,
        10,  -10,  10,
        10,  10,  -10,
        10,  10,  10,

        // back
        -10,  -10,  -10,
        -10,  10,   -10,
        10,   -10,  -10,
        10,   -10,  -10,
        -10,  10,   -10,
        10,   10,   -10,

        // top
        -10,  10,   10,
        10,  10,   10,
        -10,  10,   -10,
        -10,  10,   -10,
        10,  10,   10,
        10,  10,   -10,

        // down
        -10, -10,   10,
        -10, -10,   -10,
        10,  -10,   10,
        -10, -10,   -10,
        10,  -10,   -10,
        10,  -10,   10
      ]);
    }

    function getDefaultColor() {
      return new Uint8Array([
        // front
        255,  0, 0,
        255,  0, 0,
        255,  0, 0,
        255,  0, 0,
        255,  0, 0,
        255,  0, 0,

        // left
        0,  255, 0,
        0,  255, 0,
        0,  255, 0,
        0,  255, 0,
        0,  255, 0,
        0,  255, 0,

        // right
        0,  0, 255,
        0,  0, 255,
        0,  0, 255,
        0,  0, 255,
        0,  0, 255,
        0,  0, 255,

        // back
        255,  0, 255,
        255,  0, 255,
        255,  0, 255,
        255,  0, 255,
        255,  0, 255,
        255,  0, 255,

        // top
        255,  255, 0,
        255,  255, 0,
        255,  255, 0,
        255,  255, 0,
        255,  255, 0,
        255,  255, 0,

        // down
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200
      ]);
    }

    function getHorsesBody() {
      return new Float32Array([
          // down
          -5, 0,  5,
          -5, 0,  -5,
          5,  0,  5,

          -5, 0,  -5,
          5,  0,  -5,
          5,  0,  5,

          // front
          -5,  0,  5,
          5,  0,  5,
          0, 5,   0,

          // left
          -5,  0,  -5,
          -5,  0,  5,
          0,   5,   0,

          // right
          5,  0,  5,
          5,  0,  -5,
          0,   5,   0,

          // back
          -5,  0,  -5,
          0, 5,   0,
          5,  0,  -5,
        ]);
    }

    function getHorsesColor() {
      return new Uint8Array([
        // down
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // front
        255, 0, 0,
        255, 0, 0,
        255, 0, 0,

        // left
        0,  255, 0,
        0,  255, 0,
        0,  255, 0,

        // right
        0,  0, 255,
        0,  0, 255,
        0,  0, 255,

        // back
        255,  0, 255,
        255,  0, 255,
        255,  0, 255,        
      ]);
    }

    return {
      nDefaultBoardGap: nDefaultBoardGap,
      nDefaultHorsesGap: nDefaultHorsesGap,
      getDefaultBody: getDefaultBody,
      getDefaultColor: getDefaultColor,
      getHorsesBody: getHorsesBody,
      getHorsesColor: getHorsesColor,
    };
  }));
  