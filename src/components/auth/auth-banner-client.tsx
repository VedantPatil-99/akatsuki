"use client";

import { useState } from "react";

import Link from "next/link";

import { WarningCircleIcon, XIcon } from "@phosphor-icons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AuthBannerClient() {
  const [isActive, setIsActive] = useState(true);

  if (!isActive) return null;

  return (
    <div className="absolute z-50 flex w-full items-center justify-center px-4 py-4">
      <Alert className="flex max-w-2xl justify-between border border-amber-800 shadow-sm backdrop-blur-xl">
        {/* <CircleAlertIcon /> */}
        <WarningCircleIcon size={32} />
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex-1 flex-col justify-center gap-1">
            <AlertTitle>
              You are working in <strong>Guest Mode</strong>.
            </AlertTitle>
            <AlertDescription className="mt-0.5">
              Your whiteboard and uploaded PDFs are temporarily saved to this
              device.
            </AlertDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="h-7 cursor-pointer rounded-md px-2"
              onClick={() => setIsActive(false)}
            >
              Skip for now
            </Button>
            <Button
              variant="secondary"
              className="h-7 cursor-pointer rounded-md px-2 font-semibold"
            >
              <Link href="/login">Save & Sign Up</Link>
            </Button>
          </div>
        </div>
        <button
          className="size-5 cursor-pointer"
          onClick={() => setIsActive(false)}
        >
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </button>
      </Alert>
    </div>
  );
}
