import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import Plane, { PLANE_OFFSET } from "./components/Plane";
// import Controls from "./components/Controls";
import Stars from "./components/Stars";
import MouseHandler from "./components/MouseHandler";
import Slides from "./components/Slides";

function App() {
  return (
    <>
      <Canvas
        camera={{
          position: [0, 0, PLANE_OFFSET],
        }}
        gl={{
          alpha: true,
        }}
      >
        {/* <axesHelper args={999} /> */}
        <Suspense fallback={null}>
          <Plane />
        </Suspense>
        <Stars />
        {/* <Controls /> */}
      </Canvas>
      <Slides />
      <MouseHandler />
    </>
  );
}

export default App;
