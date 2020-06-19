import React, { useRef, memo } from "react";
import { extend, useThree, useFrame } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const Controls = (props) => {
  const controls = useRef();
  const { camera, gl } = useThree();

  useFrame(() => controls.current && controls.current.update());

  return (
    <orbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      {...props}
    />
  );
};

export default memo(Controls);
