const stickyShader = {
  uniforms: {
    texture: {
      type: "t",
      value: undefined,
    },
    textureFactor: {
      type: "f",
      value: undefined,
    },
    texture2: {
      type: "t",
      value: undefined,
    },
    textureFactor2: {
      type: "f",
      value: undefined,
    },
    displacement: {
      type: "t",
      value: undefined,
    },
    displacementFactor: {
      type: "f",
      value: 0,
    },
    displacementEffectFactor: {
      type: "f",
      value: 1.2,
    },
    progress: {
      type: "f",
      value: 0,
    },
    direction: {
      type: "f",
      value: 0.5,
    },
    time: {
      type: "f",
      value: 0,
    },
    // Max length when zooming out
    offset: {
      type: "f",
      value: undefined,
    },
  },
  fragmentShader: `
    #define BORDER_WIDTH 0.015

    uniform sampler2D texture;
    uniform sampler2D texture2;
    uniform sampler2D displacement;
    uniform vec2 textureFactor;
    uniform vec2 textureFactor2;
    uniform float displacementFactor;
    uniform float displacementEffectFactor;
    varying vec2 vUv;

    // Calculate to maintain image aspect ratio
    vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
      return uvs * factor - factor / 2. + 0.5;
    }

    void main(){
      // Displacement effect
      vec4 displacement = texture2D(displacement, vUv);
      vec2 distortedPosition = vec2(vUv.x, vUv.y + displacementFactor * (displacement.r * displacementEffectFactor));
      vec2 distortedPosition2 = vec2(vUv.x, vUv.y - (1.0 - displacementFactor) * (displacement.r * displacementEffectFactor));
      vec4 _texture = texture2D(texture, centeredAspectRatio(distortedPosition, textureFactor));
      vec4 _texture2 = texture2D(texture2, centeredAspectRatio(distortedPosition2, textureFactor2));
      vec4 finalTexture = mix(_texture, _texture2, displacementFactor);
    
      // Calculating the border
      float inTop = step(BORDER_WIDTH, 1. - vUv.y);
      float inBottom = step(BORDER_WIDTH, vUv.y);
      float inLeft = step(BORDER_WIDTH, vUv.x);
      float inRight = step(BORDER_WIDTH, 1. - vUv.x);

      float isBorder = 1. - (inTop * inBottom * inLeft * inRight);
      float opacity = 1.;

      if (isBorder == 1.) {
        finalTexture = vec4(1.);
        
        if (inLeft == 0.) {
          opacity *= vUv.x / BORDER_WIDTH;
        }
        
        if (inRight == 0.) {
          opacity *= (1. - vUv.x) / BORDER_WIDTH;
        }

        if (inTop == 0.) {
          opacity *= (1. - vUv.y) / BORDER_WIDTH;
        }

        if (inBottom == 0.) {
          opacity *= vUv.y / BORDER_WIDTH;
        }
      };
      
      gl_FragColor = vec4(finalTexture.xyz, opacity);
    }
  `,
  vertexShader: `
    #define PI 3.14159265359
    varying vec2 vUv;
    uniform float offset;
    uniform float direction;
    uniform float progress;
    uniform float time;

    void main() {
      vec3 pos = position;

      // Distance from current vertex to the center (0.5, 0.5)
      float distance = length(uv.xy - 0.5);

      // Distance from the coord origin  (0, 0) to the center (0.5, 0.5)
      float sizeDist = length(vec2(0.5, 0.5));

      // Normalized distance
      float normalizedDistance = distance / sizeDist;

      float stickOutEffect = normalizedDistance ;
      float stickInEffect = -normalizedDistance ;
      float stickEffect = mix(stickOutEffect, stickInEffect, direction);

      // Stickiness of the plane. To put it simply,
      // it's the "duration/intensity" the user has to hold down the mouse
      // to "remove" the plane from the screen, then move it back away
      float stickiness = 0.7;

      float waveIn = progress * (1. / stickiness);
      float waveOut = (1. - progress) * (1. / (1. - stickiness));
      float stickProgress = min(waveIn, waveOut);

      // We can re-use stick Influcse because this one starts at the same position
      float offsetInProgress = clamp(waveIn, 0., 1.);

      // Invert stickout to get the slope moving upwards to the right
      // and move it left by 1
      float offsetOutProgress = clamp(1. - waveOut, 0., 1.);

      float offsetProgress = mix(offsetInProgress, offsetOutProgress, direction);

      pos.z += stickEffect * stickProgress * offset - offsetProgress * offset;

      pos.z += progress * sin(distance * 8. - time * 2. ) / 4.;

      gl_Position =   
          projectionMatrix * 
          modelViewMatrix * 
            vec4(pos, 1.0);
      vUv = uv;
    }
  `,
};

export default stickyShader;
