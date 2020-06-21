import React, { useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import data from "./data";
import useMainStore from "../../store/main";
import { useSpring } from "react-spring";
import { clamp } from "../../utils/calc";
import { animated } from "react-spring";
import Header from "../Header";
import { listen } from "../MouseHandler";

const SLIDE_WIDTH_RATIO = 0.6;
const SLIDE_PADDING_RATIO = 0.1;
const SLIDE_LIST_PADDING_RATIO = 0.1;

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

const SlideContainer = styled(animated.div)`
  z-index: 999;
  overflow: auto;
  padding-top: 2rem;
  margin-bottom: 2rem;

  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SlideList = styled.div`
  display: flex;
  white-space: nowrap;
  overflow: visible;

  &::before {
    content: "";
    display: block;
    width: ${100 * (SLIDE_LIST_PADDING_RATIO + SLIDE_PADDING_RATIO)}vw;
    flex: 0 0 ${100 * (SLIDE_LIST_PADDING_RATIO + SLIDE_PADDING_RATIO)}vw;
  }

  &:after {
    content: "";
    display: block;
    width: ${100 *
    (1 -
      (SLIDE_WIDTH_RATIO + SLIDE_PADDING_RATIO) +
      SLIDE_LIST_PADDING_RATIO)}vw;
    flex: 0 0
      ${100 *
      (1 -
        (SLIDE_WIDTH_RATIO + SLIDE_PADDING_RATIO) +
        SLIDE_LIST_PADDING_RATIO)}vw;
  }
`;

const Slide = styled(animated.div)`
  width: ${100 * SLIDE_WIDTH_RATIO}vw;
  flex: 0 0 ${100 * SLIDE_WIDTH_RATIO}vw;
  display: inline-block;
  color: #ffffff;
  padding-right: 10vw;
  white-space: break-spaces;

  .slide-content {
    padding: 2rem;
    position: relative;
    max-width: 600px;
  }

  .location {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .name {
    font-family: "Cinzel", serif;
    font-weight: bold;
    font-size: 3rem;
    margin-bottom: 1rem;
    line-height: 1;
    word-break: break-word;
  }

  .description {
    font-size: 0.875rem;
  }

  @media only screen and (max-width: 767px) {
    .location {
      font-size: 0.875rem;
    }

    .name {
      font-size: 1.5rem;
    }

    .description {
      font-size: 0.75rem;
    }
  }
`;

const SlideBG = styled(animated.div)`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const SlideIndex = styled(animated.div)`
  position: absolute;
  left: 2rem;
  bottom: 0;
  font-size: 5rem;
  opacity: 0.3;
`;

const Slides = () => {
  const {
    mouseStatus,
    mouseDownPos,
    activeSlideIndex,
    setActiveSlideIndex,
  } = useMainStore();
  const mouseStatusRef = useRef(mouseStatus);
  const mouseDownPosRef = useRef(mouseDownPos);
  const activeSlideIndexRef = useRef(activeSlideIndex);

  const sliderRef = useRef(null);
  const initialScrollLeft = useRef(0);

  const minScrollLeft = window.innerWidth * SLIDE_PADDING_RATIO;

  // eslint-disable-next-line
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
      const currentActiveSlideIndex = clamp(
        Math.floor(amountToScroll / slideWidth) +
          (amountToScroll % slideWidth > slideWidth * 0.5 ? 1 : 0),
        0,
        data.length - 1
      );

      if (currentActiveSlideIndex !== activeSlideIndexRef.current) {
        setActiveSlideIndex(currentActiveSlideIndex);
      }
    }
  };

  const snapToCurrenActiveSlide = useCallback(() => {
    setScrollLeft({
      scrollLeft:
        minScrollLeft +
        activeSlideIndexRef.current * (window.innerWidth * SLIDE_WIDTH_RATIO),
    });
  }, [minScrollLeft, activeSlideIndexRef, setScrollLeft]);

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
    activeSlideIndexRef.current = activeSlideIndex;
  }, [activeSlideIndex]);

  useEffect(() => {
    listen("mousemove", onMouseMove);
    listen("touchmove", onMouseMove, true);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Render slides
   */

  const getDescriptionStyle = (index) =>
    index === activeSlideIndexRef.current
      ? {
          opacity: showSlide.interpolate((value) => 1 - value),
          transform: showSlide.interpolate(
            (value) => `translateX(-${value * 10}%)`
          ),
        }
      : { opacity: 0 };

  const renderData = data.map((entry, index) => (
    <Slide
      key={`slide-${index}`}
      className="slide"
      style={
        index !== activeSlideIndexRef.current
          ? {
              opacity: showSlide,
              transform: showSlide.interpolate(
                (value) => `translateX(${(1 - value) * 10}%)`
              ),
            }
          : null
      }
    >
      <div className="slide-content">
        <div className="location">{entry.location}</div>
        <div className="name">{entry.name}</div>
        <animated.div
          className="description"
          style={getDescriptionStyle(index)}
        >
          {entry.description}
        </animated.div>
        <SlideBG style={getDescriptionStyle(index)} />
        <SlideIndex
          style={
            mouseStatusRef.current === "mousedown"
              ? {
                  opacity: showSlide.interpolate((value) => value * 0.3),
                  transform: showSlide.interpolate(
                    (value) => `translateX(-${value * 10}%)`
                  ),
                }
              : { opacity: 0 }
          }
        >
          {("0" + (index + 1)).slice(-2)}
        </SlideIndex>
      </div>
    </Slide>
  ));

  return (
    <Container>
      <Header />
      <SlideContainer
        ref={sliderRef}
        className="noselect"
        style={{
          background: showSlide.interpolate(
            (value) => `rgba(0, 0, 0, ${value * 0.3})`
          ),
        }}
      >
        <SlideList>{renderData}</SlideList>
      </SlideContainer>
    </Container>
  );
};

export default Slides;
