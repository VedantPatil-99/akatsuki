"use client";

import { useState } from "react";

import { PenNibIcon, ShapesIcon } from "@phosphor-icons/react";
import {
  DefaultStylePanel,
  GeoShapeGeoStyle,
  TldrawUiButtonIcon,
  useEditor,
} from "tldraw";

export default function Toolbar() {
  const editor = useEditor();

  const [showShapes, setShowShapes] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

  const btn =
    "w-10 h-10 rounded-lg bg-black dark:bg-zinc-800 hover:bg-blue-500 dark:hover:bg-zinc-700 text-white flex items-center justify-center";

  const dropdown =
    "absolute bottom-14 left-1/2 -translate-x-1/2 bg-black dark:bg-zinc-800 border border-white/20 rounded-xl shadow-xl p-3 z-50";

  const setShape = (shape: GeoShapeGeoStyle) => {
    editor.setCurrentTool("geo");
    editor.setStyleForNextShapes(GeoShapeGeoStyle, shape);
    setShowShapes(false);
  };

  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl border border-white/20 bg-black p-2 shadow-xl dark:bg-zinc-900">
      {/* SELECT */}
      <button
        className={btn}
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
        className={btn}
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
          className={btn}
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
        className={btn}
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
        className={btn}
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
        className={btn}
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
          className={btn}
          onClick={() => {
            setShowShapes(!showShapes);
            setShowStylePanel(false);
          }}
        >
          <ShapesIcon size={20} />
        </button>

        {showShapes && (
          <div className={`${dropdown} grid w-55 grid-cols-4 gap-2`}>
            <button className={btn} onClick={() => setShape("rectangle")}>
              <TldrawUiButtonIcon icon="geo-rectangle" />
            </button>

            <button className={btn} onClick={() => setShape("ellipse")}>
              <TldrawUiButtonIcon icon="geo-ellipse" />
            </button>

            <button className={btn} onClick={() => setShape("triangle")}>
              <TldrawUiButtonIcon icon="geo-triangle" />
            </button>

            <button className={btn} onClick={() => setShape("diamond")}>
              <TldrawUiButtonIcon icon="geo-diamond" />
            </button>

            <button className={btn} onClick={() => setShape("hexagon")}>
              <TldrawUiButtonIcon icon="geo-hexagon" />
            </button>

            <button className={btn} onClick={() => setShape("oval")}>
              <TldrawUiButtonIcon icon="geo-oval" />
            </button>

            <button className={btn} onClick={() => setShape("rhombus")}>
              <TldrawUiButtonIcon icon="geo-rhombus" />
            </button>

            <button className={btn} onClick={() => setShape("star")}>
              <TldrawUiButtonIcon icon="geo-star" />
            </button>

            <button className={btn} onClick={() => setShape("cloud")}>
              <TldrawUiButtonIcon icon="geo-cloud" />
            </button>

            <button className={btn} onClick={() => setShape("heart")}>
              <TldrawUiButtonIcon icon="geo-heart" />
            </button>

            <button
              className={btn}
              onClick={() => {
                editor.setCurrentTool("arrow");
                setShowShapes(false);
              }}
            >
              <TldrawUiButtonIcon icon="tool-arrow" />
            </button>

            <button
              className={btn}
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
        className={btn}
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
        className={btn}
        onClick={() => {
          editor.setCurrentTool("frame");
          setShowStylePanel(false);
          setShowShapes(false);
        }}
      >
        <TldrawUiButtonIcon icon="tool-frame" />
      </button>
    </div>
  );
}
