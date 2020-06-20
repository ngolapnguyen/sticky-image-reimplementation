import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useLoader, useFrame } from "react-three-fiber";
import { getViewSize, getWindowRatio, getTextureFactor } from "../utils/calc";
import stickyShader from "../shaders/sticky";
import { useSpring, animated } from "react-spring/three";
import useMainStore from "../store/main";

import baseDisplacementImg from "../img/displacement/base";
import data from "./Slides/data";

export const PLANE_OFFSET = 8;

const Plane = () => {
  const { mouseStatus, activeSlideIndex } = useMainStore();
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

  const [{ displacement }, setDisplacement] = useSpring(() => ({
    displacement: 0,
    config: {
      mass: 1,
      tension: 200,
      friction: 40,
    },
  }));

  const activeSlideIndexRef = useRef(0);
  const planeRef = useRef();
  const planeRatio = useRef();
  const { camera } = useThree();

  /**
   * Calculating viewSize, planeSize (for more detail, see getViewSize)
   */

  const viewSize = getViewSize(camera.fov, PLANE_OFFSET);
  const planeSize = {
    width: viewSize * getWindowRatio() * 1.075,
    height: viewSize * 1.075,
  };
  planeRatio.current = planeSize.width / planeSize.height;

  /**
   * Load all textures
   */

  const textures = useLoader(
    THREE.TextureLoader,
    data.map((entry) => entry.image)
  );
  const displacementTexture = useLoader(THREE.TextureLoader, [
    baseDisplacementImg,
  ]);

  /**
   * On active slide index change
   */

  useEffect(() => {
    if (activeSlideIndex % 2 === 0) {
      planeRef.current.material.uniforms.texture.value =
        textures[activeSlideIndex];
      setDisplacement({ displacement: 0 });
    } else {
      planeRef.current.material.uniforms.texture2.value =
        textures[activeSlideIndex];
      setDisplacement({ displacement: 1 });
    }

    if (activeSlideIndex !== activeSlideIndexRef.current) {
      activeSlideIndexRef.current = activeSlideIndex;
    }
  }, [textures, activeSlideIndex, setDisplacement]); // eslint-disable-line

  /**
   * On resize listener
   */

  const onResize = () => {
    planeRef.current.material.uniforms.textureFactor.value = getTextureFactor(
      planeRatio.current,
      textures[activeSlideIndexRef.current]
    );
    planeRef.current.material.uniforms.textureFactor2.value = getTextureFactor(
      planeRatio.current,
      textures[activeSlideIndexRef.current + 1]
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
          uniforms-texture-value={textures[0]}
          uniforms-texture2-value={textures[1]}
          uniforms-displacement-value={displacementTexture[0]}
          uniforms-textureFactor-value={getTextureFactor(
            planeRatio.current,
            textures[activeSlideIndexRef.current]
          )}
          uniforms-textureFactor2-value={getTextureFactor(
            planeRatio.current,
            textures[activeSlideIndexRef.current + 1]
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
