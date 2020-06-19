import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";

const Stars = () => {
  const groupRef = useRef();

  const [geometry, material, coords] = useMemo(() => {
    const geometry = new THREE.SphereBufferGeometry(0.5, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xf2f2f2),
    });
    const coords = new Array(2000)
      .fill()
      .map((i) => [
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
      ]);
    return [geometry, material, coords];
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0001;
      groupRef.current.rotation.y += 0.0001;
      groupRef.current.rotation.z += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {coords.map((pos, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={material}
          position={pos}
        />
      ))}
    </group>
  );
};

export default Stars;
