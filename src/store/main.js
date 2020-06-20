import create from "zustand";

const [useMainStore] = create((set) => ({
  mouseStatus: "",
  setMouseStatus: (status) => set((state) => ({ mouseStatus: status })),

  mouseDownPos: { x: 0, y: 0 },
  setMouseDownPos: (pos) => set((state) => ({ mouseDownPos: pos })),

  activeSlideIndex: 0,
  setActiveSlideIndex: (index) => set((state) => ({ activeSlideIndex: index })),
}));

export default useMainStore;
