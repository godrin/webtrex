function linesCollide(aline,bline) {
  // stolen from https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function#24392281
  let a=aline[0][0],
    b=aline[0][1],
    c=aline[1][0],
    d=aline[1][1],
    p=bline[0][0],
    q=bline[0][1],
    r=bline[1][0],
    s=bline[1][1];
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

function collide(alines,blines) {
  for(let a of alines) {
    for(let b of blines) {
      if(linesCollide(a,b))
        return true;
    }
  }
  return false;
}

function rotationMatrix(rotation) {
  if(!rotation) {
    rotation=0;
  }
  rotation*=Math.PI/180;
  return [
    Math.cos(rotation),-Math.sin(rotation),0,
    Math.sin(rotation),Math.cos(rotation),0,
    0,0,0];
}
function mult(m,v3) {
  return [
    m[0]*v3[0]+m[1]*v3[1]+m[2]*v3[2],
    m[3]*v3[0]+m[4]*v3[1]+m[5]*v3[2],
    m[6]*v3[0]+m[7]*v3[1]+m[8]*v3[2],
  ];
}
function scaleMatrix(m,factor) {
  return m.map(x=>x*factor);
}
function translateMatrix(m,v) {
  return [
    m[0],m[1],m[2]+v[0],
    m[3],m[4],m[5]+v[1],
    m[6],m[7],m[8]+v[2]
  ];
}

export default {
  linesCollide,collide, rotationMatrix, mult, scaleMatrix, translateMatrix
}
