"use client";

import { useEffect, useState } from "react";

import { PenNibIcon, ShapesIcon } from "@phosphor-icons/react";
import {
  DefaultStylePanel,
  GeoShapeGeoStyle,
  TldrawUiButtonIcon,
  useEditor,
  useValue,
} from "tldraw";

export default function Toolbar() {
  const editor = useEditor();

  const activeTool = useValue("active tool", () => editor.getCurrentToolId(), [
    editor,
  ]);

  const isSelect = activeTool === "select";
  const isHand = activeTool === "hand";
  const isDraw = activeTool === "draw";
  const isLaser = activeTool === "laser";
  const isHighlight = activeTool === "highlight";
  const isEraser = activeTool === "eraser";
  const isShape = activeTool === "geo";
  const isRectangle = activeTool === "rectangle";
  const isEllipse = activeTool === "ellipse";
  const isTriangle = activeTool === "triangle";
  const isDiamond = activeTool === "diamond";
  const isHexagon = activeTool === "hexagon";
  const isOval = activeTool === "oval";
  const isRhombus = activeTool === "rhombus";
  const isStar = activeTool === "star";
  const isCloud = activeTool === "cloud";
  const isHeart = activeTool === "heart";
  const isArrow = activeTool === "arrow";
  const isLine = activeTool === "line";
  const isText = activeTool === "text";
  const isFrame = activeTool === "frame";

  const [showShapes, setShowShapes] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const toolbar = document.getElementById("toolbar");

      if (toolbar && toolbar.contains(e.target as Node)) return;

      if (editor.getCurrentToolId() === "draw") {
        setShowStylePanel(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [editor]);

  const btn = (active: boolean) =>
    `w-10 h-10 rounded-lg flex items-center justify-center text-white
     transition-all duration-200 ease-out
     active:scale-90
     ${
       active
         ? "bg-blue-600 ring-2 ring-blue-400 shadow-blue-500/20"
         : "bg-black/70 backdrop-blur-md hover:bg-blue-400"
     }`;

  const dropdown =
    "absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-3 z-50";

  const setShape = (shape: GeoShapeGeoStyle) => {
    editor.setCurrentTool("geo");
    editor.setStyleForNextShapes(GeoShapeGeoStyle, shape);
    setShowShapes(false);
  };

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setShowToolbar(!showToolbar)}
        className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
          showToolbar ? "bottom-22" : "bottom-3"
        } flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 backdrop-blur-md hover:bg-black/90`}
      >
        <div
          className={`transition-transform duration-300 ${
            showToolbar ? "rotate-180" : ""
          }`}
        >
          <TldrawUiButtonIcon icon="chevron-up" />
        </div>
      </button>

      {/* TOOLBAR */}
      <div
        id="toolbar"
        className={`fixed left-1/2 -translate-x-1/2 transition-all duration-500 ease-out ${
          showToolbar
            ? "bottom-9 opacity-100"
            : "pointer-events-none -bottom-24 opacity-0"
        } flex gap-2 rounded-xl border border-white/20 bg-black/70 p-2 shadow-lg backdrop-blur-lg`}
      >
        {/* SELECT */}
        <button
          className={btn(isSelect)}
          onClick={() => {
            editor.setCurrentTool("select");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-select" />
        </button>

        {/* MOVE */}
        <button
          className={btn(isHand)}
          onClick={() => {
            editor.setCurrentTool("hand");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-hand" />
        </button>

        {/* PEN */}
        <div className="relative">
          <button
            className={btn(isDraw)}
            onClick={() => {
              editor.setCurrentTool("draw");
              setShowStylePanel(!showStylePanel);
              setShowShapes(false);
            }}
          >
            <PenNibIcon size={20} />
          </button>

          {showStylePanel && (
            <div className={dropdown}>
              <DefaultStylePanel />
            </div>
          )}
        </div>

        {/* LASER */}
        <button
          className={btn(isLaser)}
          onClick={() => {
            editor.setCurrentTool("laser");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-laser" />
        </button>

        {/* HIGHLIGHT */}
        <button
          className={btn(isHighlight)}
          onClick={() => {
            editor.setCurrentTool("highlight");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-highlight" />
        </button>

        {/* ERASER */}
        <button
          className={btn(isEraser)}
          onClick={() => {
            editor.setCurrentTool("eraser");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-eraser" />
        </button>

        {/* SHAPES */}
        <div className="relative">
          <button
            className={btn(isShape)}
            onClick={() => {
              setShowShapes(!showShapes);
              setShowStylePanel(false);
            }}
          >
            <ShapesIcon size={20} />
          </button>

          {showShapes && (
            <div className={`${dropdown} grid w-56 grid-cols-4 gap-2`}>
              <button
                className={btn(isRectangle)}
                onClick={() => setShape("rectangle")}
              >
                <TldrawUiButtonIcon icon="geo-rectangle" />
              </button>

              <button
                className={btn(isEllipse)}
                onClick={() => setShape("ellipse")}
              >
                <TldrawUiButtonIcon icon="geo-ellipse" />
              </button>

              <button
                className={btn(isTriangle)}
                onClick={() => setShape("triangle")}
              >
                <TldrawUiButtonIcon icon="geo-triangle" />
              </button>

              <button
                className={btn(isDiamond)}
                onClick={() => setShape("diamond")}
              >
                <TldrawUiButtonIcon icon="geo-diamond" />
              </button>

              <button
                className={btn(isHexagon)}
                onClick={() => setShape("hexagon")}
              >
                <TldrawUiButtonIcon icon="geo-hexagon" />
              </button>

              <button className={btn(isOval)} onClick={() => setShape("oval")}>
                <TldrawUiButtonIcon icon="geo-oval" />
              </button>

              <button
                className={btn(isRhombus)}
                onClick={() => setShape("rhombus")}
              >
                <TldrawUiButtonIcon icon="geo-rhombus" />
              </button>

              <button className={btn(isStar)} onClick={() => setShape("star")}>
                <TldrawUiButtonIcon icon="geo-star" />
              </button>

              <button
                className={btn(isCloud)}
                onClick={() => setShape("cloud")}
              >
                <TldrawUiButtonIcon icon="geo-cloud" />
              </button>

              <button
                className={btn(isHeart)}
                onClick={() => setShape("heart")}
              >
                <TldrawUiButtonIcon icon="geo-heart" />
              </button>

              <button
                className={btn(isArrow)}
                onClick={() => {
                  editor.setCurrentTool("arrow");
                  setShowShapes(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-arrow" />
              </button>

              <button
                className={btn(isLine)}
                onClick={() => {
                  editor.setCurrentTool("line");
                  setShowShapes(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-line" />
              </button>
            </div>
          )}
        </div>

        {/* TEXT */}
        <button
          className={btn(isText)}
          onClick={() => {
            editor.setCurrentTool("text");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-text" />
        </button>

        {/* FRAME */}
        <button
          className={btn(isFrame)}
          onClick={() => {
            editor.setCurrentTool("frame");
            setShowStylePanel(false);
            setShowShapes(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-frame" />
        </button>
      </div>
    </>
  );
}
