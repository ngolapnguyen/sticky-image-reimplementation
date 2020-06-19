import * as THREE from "three";

/**
 * Calculate the client's vertical view size in ThreeJS coord system
 * based on the camera's fov and z position
 * so that, for example, a plane with height = viewSize at position (0, 0, 0)
 * will cover the vertical length of the client's screen
 */
export const getViewSize = (fov, z) => {
  const fovInRadians = (fov * Math.PI) / 180;
  return Math.abs(z * Math.tan(fovInRadians / 2) * 2);
};

/**
 * Get window width/height ratio
 */
export const getWindowRatio = () => {
  return window.innerWidth / window.innerHeight;
};

/**
 * Calculate texture factor to maintain the image ratio
 */
export const getTextureFactor = (planeRatio, texture) => {
  let factorX = 1;
  let factorY = 1;

  if (texture) {
    const textureRatio = texture.image.width / texture.image.height;

    if (planeRatio > textureRatio) {
      factorY = textureRatio / planeRatio;
    } else {
      factorX = planeRatio / textureRatio;
    }
  }

  return new THREE.Vector2(factorX, factorY);
};

/**
 * Clamp
 */
export const clamp = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};
