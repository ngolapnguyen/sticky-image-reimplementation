import React, { useEffect } from "react";
import styled from "styled-components";
import { useTrail, animated } from "react-spring";
import useMainStore from "../store/main";

const CIRCLE_SIZE = 48;
const DOT_SIZE = 8;

const Follower = styled(animated.div)`
  position: absolute;
  border-radius: 50%;
  left: 0;
  top: 0;
  pointer-events: none;
`;

const CursorFollower = styled(Follower)`
  border: 2px solid #ffffff;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
`;

const DotFollower = styled(Follower)`
  background: #ffffff;
  width: ${DOT_SIZE}px;
  height: ${DOT_SIZE}px;
`;

const circleConfig = { mass: 5, tension: 800, friction: 100 };
const dotConfig = { tension: 1200, friction: 50 };
const transform = (x, y) =>
  `translate3d(${x}px, ${y}px, 0) translate3d(-50%,-50%, 0)`;

const MouseHandler = () => {
  const { setMouseStatus, setMouseDownPos } = useMainStore();
  const [circleTrail, setCircleTrail] = useTrail(2, () => ({
    xy: [0, 0],
    config: circleConfig,
  }));
  const [dotTrail, setDotTrail] = useTrail(2, () => ({
    xy: [0, 0],
    config: dotConfig,
  }));

  const onMouseDown = (event) => {
    setMouseStatus("mousedown");
    setMouseDownPos({ x: event.clientX, y: event.clientY });
  };

  const onMouseUp = () => {
    setMouseStatus("mouseup");
  };

  const onMouseMove = (event) => {
    setCircleTrail({ xy: [event.clientX, event.clientY] });
    setDotTrail({ xy: [event.clientX, event.clientY] });
  };

  useEffect(() => {
    // No handler for touch events yet. Might come back to it later
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <CursorFollower
        style={{ transform: circleTrail[0].xy.interpolate(transform) }}
      />
      <DotFollower
        style={{ transform: dotTrail[1].xy.interpolate(transform) }}
      />
    </>
  );
};

export default MouseHandler;
