export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec4 a_color;
  attribute float a_size;
  attribute float a_shape; // 0=circle, 1=square, 2=triangle, 3=star
  
  uniform vec2 u_resolution;
  
  varying vec4 v_color;
  varying float v_size;
  varying float v_shape;
  
  void main() {
    vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_PointSize = a_size;
    
    v_color = a_color;
    v_size = a_size;
    v_shape = a_shape;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  
  varying vec4 v_color;
  varying float v_size;
  varying float v_shape;
  
  // Function to check if point is inside a triangle
  bool isInsideTriangle(vec2 coord) {
    // Upward pointing triangle with vertices at:
    // Top: (0, 0.5), Bottom-left: (-0.43, -0.25), Bottom-right: (0.43, -0.25)
    vec2 v0 = vec2(0.0, 0.5);
    vec2 v1 = vec2(-0.433, -0.25); // sqrt(3)/4 ≈ 0.433
    vec2 v2 = vec2(0.433, -0.25);
    
    // Barycentric coordinates method
    float denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
    float a = ((v1.y - v2.y) * (coord.x - v2.x) + (v2.x - v1.x) * (coord.y - v2.y)) / denom;
    float b = ((v2.y - v0.y) * (coord.x - v2.x) + (v0.x - v2.x) * (coord.y - v2.y)) / denom;
    float c = 1.0 - a - b;
    
    return a >= 0.0 && b >= 0.0 && c >= 0.0;
  }
  
  // Function to create a 5-pointed star
  bool isInsideStar(vec2 coord) {
    float angle = atan(coord.y, coord.x);
    float dist = length(coord);
    
    // Normalize angle to 0-2π range
    angle = angle + 3.14159;
    
    // Calculate star radius based on angle
    // 5-pointed star with alternating inner and outer radii
    float segmentAngle = mod(angle, 1.256637); // 2π/5 ≈ 1.256637
    float normalizedAngle = segmentAngle / 1.256637;
    
    // Create sharp points by using a triangular wave
    float starRadius;
    if (normalizedAngle < 0.5) {
      starRadius = 0.2 + 0.3 * (normalizedAngle * 2.0); // Rise to peak
    } else {
      starRadius = 0.5 - 0.3 * ((normalizedAngle - 0.5) * 2.0); // Fall from peak
    }
    
    return dist <= starRadius;
  }
  
  void main() {
    vec2 coord = gl_PointCoord - 0.5; // Center coordinates (-0.5 to 0.5)
    
    if (v_shape < 0.5) { // Circle
      float dist = length(coord);
      if (dist > 0.5) discard;
      
    } else if (v_shape < 1.5) { // Square
      // Square is already handled by gl_PointCoord naturally
      // No discard needed - all fragments within the point are valid
      
    } else if (v_shape < 2.5) { // Triangle
      if (!isInsideTriangle(coord)) discard;
      
    } else { // Star (v_shape >= 2.5)
      if (!isInsideStar(coord)) discard;
    }
    
    gl_FragColor = v_color;
  }
`;
