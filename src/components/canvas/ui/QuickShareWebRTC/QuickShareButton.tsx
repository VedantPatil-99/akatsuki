"use client";

import { useEffect, useRef, useState } from "react";

import { QrCodeIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheckIcon, Check, DownloadCloud, WifiOff } from "lucide-react";
import { DataConnection, Peer } from "peerjs";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WebRTCFilePayload } from "@/lib/types/webrtc";

export function QuickShareButton() {
  const [peerId, setPeerId] = useState<string>("");
  const [receivedFile, setReceivedFile] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const peerRef = useRef<Peer | null>(null);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return "";
  };

  // Function for Localhost Testing

  // const getBaseUrl = () => {
  //   if (typeof window !== "undefined") {
  //     // Hardcode it ONLY for this test to prove the connection works
  //     return `http://192.168.1.XX:3000`; // Use your actual IP here (e.g., 192.168.1.5)
  //   }
  //   return "";
  // };

  const shareUrl = peerId
    ? `${getBaseUrl()}/share/mobile?peerId=${peerId}`
    : "";

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id: string) => setPeerId(id));

    peer.on("connection", (conn: DataConnection) => {
      setIsConnected(true);
      conn.on("data", (data: unknown) => {
        const payload = data as WebRTCFilePayload;
        if (payload?.file) {
          const blob = new Blob([payload.file]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = payload.fileName;
          a.click();
          setReceivedFile(payload.fileName);
          setTimeout(() => setReceivedFile(null), 5000);
        }
      });
      conn.on("close", () => setIsConnected(false));
    });

    return () => peer.destroy();
  }, []);

  return (
    <>
      <style jsx global>{`
        .akatsuki-share-dialog button:has(svg.lucide-x) {
          top: 1.5rem !important;
          right: 1.5rem !important;
          width: 28px !important;
          height: 28px !important;
          color: white !important;
          background: transparent !important;
          border: 1px solid transparent !important;
          border-radius: 9999px !important;
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
          opacity: 0.8;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .akatsuki-share-dialog button:has(svg.lucide-x) svg {
          width: 14px !important;
          height: 14px !important;
          stroke-width: 3px !important;
        }

        .akatsuki-share-dialog button:has(svg.lucide-x):hover {
          opacity: 1;
          border-color: rgba(59, 130, 246, 0.4) !important;
          background: rgba(59, 130, 246, 0.05) !important;
          box-shadow:
            inset 0 0 12px rgba(59, 130, 246, 0.6),
            0 0 15px rgba(59, 130, 246, 0.1) !important;
          transform: rotate(90deg);
        }

        /* Green Radar Pulse: Expanding with internal gradient fill */
        @keyframes radar-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
            background: rgba(34, 197, 94, 0);
          }
          50% {
            opacity: 0.6;
            background: rgba(34, 197, 94, 0.15);
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
            background: rgba(34, 197, 94, 0);
          }
        }

        .radar-effect {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1.5px solid #22c55e;
          animation: radar-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          pointer-events: none;
        }

        /* Badge Cloud Rotation */
        @keyframes badge-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .badge-cloud-wrapper {
          position: absolute;
          inset: 0;
          animation: badge-spin 4s linear infinite;
        }
      `}</style>

      <Dialog
        onOpenChange={(open) => {
          if (open) setShowPopup(true);
        }}
      >
        <div className="relative inline-block">
          {/* Green Radar Layer */}
          {isConnected && <div className="radar-effect" />}

          {/* Connected Badge Layer */}
          {isConnected && (
            <div className="absolute -top-1.5 -right-1.5 z-20 flex h-4 w-4 items-center justify-center">
              <div className="badge-cloud-wrapper">
                {/* This rotates the "cloud" outer part of the BadgeCheckIcon */}
                <BadgeCheckIcon
                  className="h-4 w-4 fill-green-500 text-green-500"
                  strokeWidth={0}
                />
              </div>
              {/* This is the stable small tick mark in the center */}
              <Check className="relative z-30 h-2 w-2 stroke-[4px] text-white" />
            </div>
          )}

          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`pointer-events-auto relative z-10 h-9 w-9 rounded-full border p-0 shadow-sm transition-all duration-300 ${
                isConnected
                  ? "border-blue-500 bg-blue-600/20 shadow-blue-500/20"
                  : "border-zinc-200/20 bg-white/10 backdrop-blur-sm"
              }`}
            >
              <QrCodeIcon
                className={`h-4.5 w-4.5 ${isConnected ? "text-blue-400" : "text-neutral-800 dark:text-neutral-50"}`}
              />
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="akatsuki-share-dialog overflow-hidden rounded-[2.5rem] border-blue-500/30 bg-black text-white shadow-[0_0_50px_rgba(59,130,246,0.15)] sm:max-w-90">
          <DialogHeader className="pt-4">
            <DialogTitle className="text-center text-[15px] font-black tracking-[0.3em] text-blue-500/60 uppercase">
              Quick Share
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex flex-col items-center space-y-6 p-4">
            <div className="relative rounded-[2rem] bg-linear-to-b from-blue-500 via-transparent to-blue-600 p-1 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <motion.div
                animate={{ filter: showPopup ? "blur(15px)" : "blur(0px)" }}
                transition={{ duration: 0.8 }}
                className="rounded-[1.8rem] bg-black p-4"
              >
                {shareUrl && (
                  <QRCodeSVG
                    value={shareUrl}
                    size={200}
                    level="H"
                    bgColor="#000000"
                    fgColor="#FFFFFF"
                    className="rounded-lg"
                  />
                )}
              </motion.div>

              <AnimatePresence>
                {showPopup && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, y: 120 }}
                    className="absolute inset-0 z-20 flex items-center justify-center px-6"
                  >
                    <div className="space-y-3 text-center">
                      <div className="flex justify-center">
                        <WifiOff className="h-8 w-8 animate-pulse text-blue-400" />
                      </div>
                      <p className="text-sm font-bold tracking-tight text-white">
                        Please Connect to the same network
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowPopup(false)}
                        className="h-7 rounded-full bg-blue-600 px-6 text-[10px] font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-500"
                      >
                        GOT IT
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pb-2 text-center">
              <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Peer Identity
              </p>
              <code className="rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 font-mono text-xs text-blue-400/80">
                {peerId || "INITIALIZING..."}
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {receivedFile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed right-6 bottom-6 z-100 flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-black/90 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <DownloadCloud className="h-4 w-4 text-white" />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-black text-blue-400 uppercase">
                File Synced
              </p>
              <p className="w-24 truncate text-[11px] font-medium text-white">
                {receivedFile}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
