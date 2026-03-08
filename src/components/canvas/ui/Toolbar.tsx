"use client";

import { useEffect, useRef, useState } from "react";

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
  const isShape =
    activeTool === "geo" || activeTool === "arrow" || activeTool === "line";
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
  const [showPenPanel, setShowPenPanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), 3000);
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const toolbar = document.getElementById("toolbar");

      if (toolbar && toolbar.contains(e.target as Node)) return;

      if (editor.getCurrentToolId() === "draw") {
        setShowPenPanel(false);
      }

      if (editor.getCurrentToolId() === "text") {
        setShowTextPanel(false);
        setShowMore(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [editor]);

  const btn = (active: boolean) =>
    `w-10 h-10 rounded-lg flex items-center justify-start text-white
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
    editor.updateInstanceState({ isToolLocked: true });
    setShowShapes(false);
  };

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        onPointerEnter={resetTimer}
        onClick={() => {
          setShowToolbar(!showToolbar);
          resetTimer(); // Reset when clicked
        }}
        className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
          showToolbar ? "bottom-20" : "bottom-3"
        } ${
          isIdle ? "pointer-events-none opacity-0" : "opacity-100"
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
        onPointerEnter={resetTimer}
        onPointerMove={resetTimer}
        className={`fixed left-1/2 -translate-x-1/2 transition-all duration-500 ease-out ${
          showToolbar
            ? "bottom-4 opacity-100"
            : "pointer-events-none -bottom-24 opacity-0"
        } flex gap-2 rounded-xl border border-white/20 bg-black/70 p-2 shadow-lg backdrop-blur-lg`}
      >
        {/* PEN */}
        <div className="relative">
          <button
            className={`${btn(isDraw && !showShapes && !showMore)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
            onClick={() => {
              editor.setCurrentTool("draw");
              setShowPenPanel(!showPenPanel);
              setShowTextPanel(false);
              setShowShapes(false);
              setShowMore(false);
            }}
          >
            <PenNibIcon size={20} />
            <span
              className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isDraw && !showShapes && !showMore ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
            >
              Pen
            </span>
          </button>

          {showPenPanel && (
            <div className={dropdown}>
              <DefaultStylePanel />
            </div>
          )}
        </div>

        {/* ERASER */}
        <button
          className={`${btn(isEraser && !showShapes && !showMore)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
          onClick={() => {
            editor.setCurrentTool("eraser");
            setShowStylePanel(false);
            setShowShapes(false);
            setShowMore(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-eraser" />
          <span
            className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isEraser && !showShapes && !showMore ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
          >
            Eraser
          </span>
        </button>

        {/* SELECT */}
        <button
          className={`${btn(isSelect && !showShapes && !showMore)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
          onClick={() => {
            editor.setCurrentTool("select");
            setShowPenPanel(false);
            setShowShapes(false);
            setShowMore(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-pointer" />
          <span
            className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSelect && !showShapes && !showMore ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
          >
            Select
          </span>
        </button>

        {/* MOVE */}
        <button
          className={`${btn(isHand && !showShapes && !showMore)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
          onClick={() => {
            editor.setCurrentTool("hand");
            setShowStylePanel(false);
            setShowShapes(false);
            setShowMore(false);
          }}
        >
          <TldrawUiButtonIcon icon="tool-hand" />
          <span
            className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isHand && !showShapes && !showMore ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
          >
            Move
          </span>
        </button>

        {/* SHAPES */}
        <div className="relative">
          <button
            className={`${btn((isShape || showShapes) && !showMore)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
            onClick={() => {
              setShowShapes(!showShapes);
              setShowStylePanel(false);
              setShowMore(false);
            }}
          >
            <ShapesIcon size={20} />
            <span
              className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${(isShape || showShapes) && !showMore ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
            >
              Shapes
            </span>
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

        {/* MORE */}
        <div className="relative">
          <button
            className={`${btn((isLaser || isHighlight || isText || isFrame || showTextPanel || showMore) && !showShapes)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
            onClick={() => {
              setShowMore(!showMore);
              setShowShapes(false);
              setShowPenPanel(false);
              setShowTextPanel(false);
            }}
          >
            <TldrawUiButtonIcon icon="dots-horizontal" />
            <span
              className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${(isLaser || isHighlight || isText || isFrame || showTextPanel || showMore) && !showShapes ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
            >
              More
            </span>
          </button>

          {showMore && (
            <div className={`${dropdown} flex w-40 flex-col gap-2 p-2`}>
              {/* TEXT */}
              <button
                className={`${btn(isText)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
                onClick={() => {
                  editor.setCurrentTool("text");
                  setShowTextPanel(true);
                  setShowPenPanel(false);
                  setShowShapes(false);
                  setShowMore(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-text" />
                <span
                  className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isText ? "ml-2 max-w-64 opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-64 group-hover:opacity-100"} `}
                >
                  Text
                </span>
              </button>

              {/* LASER */}
              <button
                className={`${btn(isLaser)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
                onClick={() => {
                  editor.setCurrentTool("laser");
                  setShowMore(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-laser" />
                <span
                  className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isLaser ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
                >
                  Laser
                </span>
              </button>

              {/* HIGHLIGHT */}
              <button
                className={`${btn(isHighlight)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
                onClick={() => {
                  editor.setCurrentTool("highlight");
                  setShowMore(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-highlight" />
                <span
                  className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isHighlight ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
                >
                  Highlight
                </span>
              </button>

              {/* FRAME */}
              <button
                className={`${btn(isFrame)} group flex w-auto items-center gap-0 px-3 transition-all duration-300 ease-in-out hover:gap-1`}
                onClick={() => {
                  editor.setCurrentTool("frame");
                  setShowMore(false);
                }}
              >
                <TldrawUiButtonIcon icon="tool-frame" />
                <span
                  className={`overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isFrame ? "ml-2 max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"} `}
                >
                  Frame
                </span>
              </button>
            </div>
          )}
        </div>
        {showTextPanel && isText && (
          <div className={dropdown}>
            <DefaultStylePanel />
          </div>
        )}
      </div>
    </>
  );
}
