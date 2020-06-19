import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useLoader, useFrame } from "react-three-fiber";
import { getViewSize, getWindowRatio, getTextureFactor } from "../utils/calc";
import stickyShader from "../shaders/sticky";
import { useSpring, animated } from "react-spring/three";
import useMainStore from "../store/main";

import baseDisplacementImg from "../img/displacement/base";

export const PLANE_OFFSET = 8;

const mockSrc =
  "https://images.unsplash.com/photo-1519058497187-7167f17c6daf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2048&q=100";

const Plane = () => {
  const { mouseStatus } = useMainStore();
  const { direction } = useSpring({
    direction: mouseStatus === "mousedown" ? 0 : 1,
    config: {
      mass: 1,
      friction: 30,
    },
  });

  const { progress } = useSpring({
    progress: mouseStatus === "mousedown" ? 1 : 0,
    config: {
      mass: 1,
      friction: 40,
    },
  });

  const { displacement } = useSpring({
    displacement: mouseStatus === "mousedown" ? 1 : 0,
    config: {
      mass: 1,
      tension: 200,
      friction: 40,
    },
  });

  const planeRef = useRef();
  const planeRatio = useRef();
  const { camera } = useThree();

  /**
   * Calculating viewSize, planeSize (for more detail, see getViewSize)
   */

  const viewSize = getViewSize(camera.fov, PLANE_OFFSET);
  const planeSize = {
    width: viewSize * getWindowRatio() * 1.375,
    height: viewSize * 1.125,
  };

  /**
   * Calculating to maintain the texture's image ratio
   */

  planeRatio.current = planeSize.width / planeSize.height;
  const texture = useLoader(THREE.TextureLoader, [
    mockSrc,
    mockSrc,
    baseDisplacementImg,
  ]);

  /**
   * On resize listener
   */

  const onResize = () => {
    planeRef.current.material.uniforms.textureFactor.value = getTextureFactor(
      planeRatio.current,
      texture[0]
    );
    planeRef.current.material.uniforms.textureFactor2.value = getTextureFactor(
      planeRatio.current,
      texture[1]
    );
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Run every frame
   */

  useFrame(() => {
    if (planeRef.current) {
      planeRef.current.material.uniforms.time.value += 0.01;
    }
  });

  return (
    <group>
      <animated.mesh ref={planeRef}>
        <planeBufferGeometry
          attach="geometry"
          args={[planeSize.width, planeSize.height, 100, 100]}
        />
        <animated.shaderMaterial
          attach="material"
          uniforms={stickyShader.uniforms}
          uniforms-texture-value={texture[0]}
          uniforms-texture2-value={texture[1]}
          uniforms-displacement-value={texture[2]}
          uniforms-textureFactor-value={getTextureFactor(
            planeRatio.current,
            texture[0]
          )}
          uniforms-textureFactor2-value={getTextureFactor(
            planeRatio.current,
            texture[1]
          )}
          uniforms-direction-value={direction}
          uniforms-progress-value={progress}
          uniforms-displacementFactor-value={displacement}
          uniforms-offset-value={PLANE_OFFSET}
          vertexShader={stickyShader.vertexShader}
          fragmentShader={stickyShader.fragmentShader}
          side={THREE.DoubleSide}
          transparent={true}
        />
      </animated.mesh>
    </group>
  );
};

export default Plane;
