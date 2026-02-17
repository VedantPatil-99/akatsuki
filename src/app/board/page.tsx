import React from "react";

import AkatsukiCanvas from "@/components/canvas/AkatsukiCanvas";

const Board = () => {
  return (
    <>
      <div className="h-screen w-screen overflow-hidden">
        <AkatsukiCanvas />
      </div>
    </>
  );
};

export default Board;
