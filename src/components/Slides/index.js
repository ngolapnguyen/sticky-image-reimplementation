import React, { useMemo, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import data from "./data";
import useMainStore from "../../store/main";
import { useSpring } from "react-spring";
import { clamp } from "../../utils/calc";
import { animated } from "react-spring";

const SLIDE_WIDTH_RATIO = 0.6;
const SLIDE_PADDING_RATIO = 0.1;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
`;

const SlideContainer = styled.div`
  z-index: 999;
  overflow: auto;
  margin-bottom: 10%;

  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SlideList = styled.div`
  display: flex;
  white-space: nowrap;
  overflow: visible;

  &::before,
  &::after {
    content: "";
    display: block;
    width: ${100 * (0.2 + SLIDE_PADDING_RATIO)}vw;
    flex: 0 0 ${100 * (0.2 + SLIDE_PADDING_RATIO)}vw;
  }
`;

const Slide = styled(animated.div)`
  width: ${100 * SLIDE_WIDTH_RATIO}vw;
  flex: 0 0 ${100 * SLIDE_WIDTH_RATIO}vw;
  display: inline-block;
  color: #ffffff;
  padding-right: 10vw;

  .location {
    font-size: 1.5rem;
  }

  .name {
    font-weight: bold;
    font-size: 4rem;
    white-space: break-spaces;
  }
`;

const Slides = () => {
  const { mouseStatus, mouseDownPos } = useMainStore();
  const mouseStatusRef = useRef(mouseStatus);
  const mouseDownPosRef = useRef(mouseDownPos);
  const sliderRef = useRef(null);
  const initialScrollLeft = useRef(0);
  const activeSlideIndex = useRef(0);

  const minScrollLeft = window.innerWidth * SLIDE_PADDING_RATIO;

  const [_, setScrollLeft] = useSpring(() => ({
    immediate: false,
    scrollLeft: window.innerWidth * 0.1,
    onFrame: (props) => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = props.scrollLeft;
      }
    },
    config: {
      mass: 1,
      tension: 200,
    },
  }));

  const { showSlide } = useSpring({
    showSlide: mouseStatus === "mousedown" ? 1 : 0,
  });

  const onMouseMove = (event) => {
    if (mouseStatusRef.current === "mousedown") {
      const amountToScroll =
        initialScrollLeft.current -
        (event.clientX - mouseDownPosRef.current.x) * 2;
      setScrollLeft({ scrollLeft: amountToScroll });

      const slideWidth = window.innerWidth * SLIDE_WIDTH_RATIO;
      activeSlideIndex.current = clamp(
        Math.floor(amountToScroll / slideWidth) +
          (amountToScroll % slideWidth > slideWidth * 0.7 ? 1 : 0),
        0,
        data.length - 1
      );
    }
  };

  const snapToCurrenActiveSlide = useCallback(() => {
    setScrollLeft({
      scrollLeft:
        minScrollLeft +
        activeSlideIndex.current * (window.innerWidth * SLIDE_WIDTH_RATIO),
    });
  }, [minScrollLeft, activeSlideIndex, setScrollLeft]);

  useEffect(() => {
    if (mouseStatus === "mousedown") {
      initialScrollLeft.current = sliderRef.current.scrollLeft;
    } else if (mouseStatus === "mouseup") {
      snapToCurrenActiveSlide();
    }

    mouseStatusRef.current = mouseStatus;
    mouseDownPosRef.current = mouseDownPos;
  }, [mouseStatus, mouseDownPos, setScrollLeft, snapToCurrenActiveSlide]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderData = data.map((entry, index) => (
    <Slide
      key={`slide-${index}`}
      className="slide"
      style={
        index !== activeSlideIndex.current
          ? {
              opacity: showSlide,
              transform: showSlide.interpolate(
                (value) => `translateX(${(1 - value) * 10}%)`
              ),
            }
          : null
      }
    >
      <div className="location">{entry.location}</div>
      <div className="name">{entry.name}</div>
    </Slide>
  ));

  return (
    <Container>
      <SlideContainer ref={sliderRef} className="noselect">
        <SlideList>{renderData}</SlideList>
      </SlideContainer>
    </Container>
  );
};

export default Slides;
