(function(root, factory) {  // eslint-disable-line
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return factory.call(root);
    });
  } else {
    // Browser globals
    root.webglShader = factory.call(root);
  }
}(this, function() {
  vertextShader = `
    attribute vec4 a_position;

    uniform vec4 u_color;
    uniform mat4 u_matrix;
    
    varying vec4 v_color;
    
    void main() {
      // Multiply the position by the matrix.
      gl_Position = u_matrix * a_position;
    
      // Pass the color to the fragment shader.
      v_color = u_color;
    }
  `;

  fragmentShader = `
    precision mediump float;
    
    // Passed in from the vertex shader.
    varying vec4 v_color;
    
    void main() {
      gl_FragColor = v_color;
    }
  `;

  return {
    vertextShader,
    fragmentShader,
  };
}));
