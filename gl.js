import Geometry from './math.js';

var defaultVertexShader= 'attribute vec3 coordinates;' +
  'uniform vec3 myposition;' +
  'uniform mat3 rotation;' +
  'uniform float size;' +
  'void main(void) {' +
  ' vec3 c = coordinates;'+
  ' c= rotation*c;'+
  ' c*=size;'+
  ' gl_Position = vec4(c+myposition, 1.0);' +
  '}';

let defaultFragShader =
  'void main(void) {' +
  'gl_FragColor = vec4(0.5, 0.5, 0.8, 0.1);' +
  '}';
export class Shader {
  constructor(gl, vertCode, fragCode) {
    this.gl = gl;

    if(!vertCode) {
      vertCode = defaultVertexShader;
    }
    if(!fragCode) {
      fragCode = defaultFragShader;
    }

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    this.shaderProgram = shaderProgram;
    this.variables={}
  }

  use() {
    // Use the combined shader program object
    this.gl.useProgram(this.shaderProgram);
  }

  setFloats(name, dimension, buffer) {
    this.use();
    if(!(name in this.variables)) {
      this.variables[name] = this.gl.getAttribLocation(this.shaderProgram, name);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(this.variables[name], dimension, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.variables[name]);
  }
  setUniformM(name, value) {
    if(!(name in this.variables)) {
      this.variables[name] = this.gl.getUniformLocation(this.shaderProgram, name)
    }
    switch(value.length) {
      case 9:
        this.gl.uniformMatrix3fv(this.variables[name], false, value);break;
    }
  }
  setUniform(name, value) {
    if(!(name in this.variables)) {
      this.variables[name] = this.gl.getUniformLocation(this.shaderProgram, name)
    }
    switch(value.length) {
      case 3:
        this.gl.uniform3fv(this.variables[name], value);break;
      case 2:
        this.gl.uniform2fv(this.variables[name], value);break;
      case 1:
        this.gl.uniform1fv(this.variables[name], value);break;
    }
  }
}

export class LinePainter {
  constructor(gl, vertices, shader) {
    this.vertices = vertices;
    this.gl = gl;
    this.shader = shader;

    this.vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.shader.setFloats("coordinates",3,this.vertex_buffer);
  }
  get buffer() {
    return this.vertex_buffer;
  }
  draw(enemy) {
    this.shader.setUniform("myposition",enemy.position);
    this.shader.setUniform("size",[enemy.size]);
    this.shader.setFloats("coordinates",3,this.vertex_buffer);
    let m = Geometry.rotationMatrix(enemy.rotation);
    this.shader.setUniformM("rotation",m);
    this.shader.use();
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, this.vertices.length/3);
  }
  lines(enemy) {
    let transformed=[];

    let m = Geometry.rotationMatrix(enemy.rotation);
    m = Geometry.scaleMatrix(m,enemy.size);
    m = Geometry.translateMatrix(m,enemy.position);
    
    for(let i=0;i<this.vertices.length;i+=3) {
      let v = Geometry.mult(m,this.vertices.slice(i,i+3));

      transformed.push(v.slice(0,2));
    }

    let lines=[]
    // vectors to lines
    for(let i=0;i<transformed.length;i++) {
      lines.push([transformed[i],transformed[(i+1)%transformed.length]]);
    }

    return lines;
  }
}

export function initGlFrame(gl, canvas) {
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.lineWidth(3);
}
