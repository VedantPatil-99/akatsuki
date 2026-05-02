"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Share2, Upload } from "lucide-react";
import { DataConnection, Peer } from "peerjs";

import { TransferStatus, WebRTCFilePayload } from "@/lib/types/webrtc";

function MobileShareContent() {
  const searchParams = useSearchParams();
  const targetPeerId = searchParams.get("peerId");
  const [status, setStatus] = useState<TransferStatus>("connecting");
  const connRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    if (!targetPeerId) return;
    const peer = new Peer();

    peer.on("open", () => {
      const conn = peer.connect(targetPeerId);
      connRef.current = conn;
      conn.on("open", () => setStatus("ready"));
      conn.on("close", () => setStatus("connecting"));
    });

    return () => peer.destroy();
  }, [targetPeerId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !connRef.current) return;

    setStatus("sending");
    const arrayBuffer = await file.arrayBuffer();

    const payload: WebRTCFilePayload = {
      file: arrayBuffer,
      fileName: file.name,
      fileType: file.type,
    };

    connRef.current.send(payload);
    setStatus("done");
    setTimeout(() => setStatus("ready"), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-sm space-y-8 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex rounded-3xl border border-blue-500/20 bg-blue-600/10 p-4"
        >
          <Share2 className="h-8 w-8 text-blue-500" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">
            AKATSUKI DIRECT
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.4em] text-zinc-500 uppercase">
            Encrypted Tunnel
          </p>
        </div>

        <div className="flex min-h-50 items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "connecting" && (
              <motion.div
                key="c"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-bold text-zinc-400">
                  Syncing with Whiteboard...
                </p>
              </motion.div>
            )}

            {status === "ready" && (
              <motion.label
                key="r"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="group block w-full cursor-pointer"
              >
                <div className="rounded-[2.5rem] border-2 border-dashed border-zinc-800 p-12 transition-all group-active:scale-95 group-active:bg-blue-600/5">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-zinc-700 group-hover:text-blue-500" />
                  <span className="text-xs font-black tracking-widest text-zinc-500">
                    SEND DOCUMENT
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </motion.label>
            )}

            {status === "done" && (
              <motion.div
                key="d"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2
                    className="h-10 w-10 text-black"
                    strokeWidth={3}
                  />
                </div>
                <p className="text-lg font-black">UPLOADED</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function MobileSharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <MobileShareContent />
    </Suspense>
  );
}
