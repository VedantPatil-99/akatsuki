"use client";

import Link from "next/link";

import { FloppyDiskIcon, UserIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface CanvasAuthButtonProps {
  isAnonymous: boolean;
}

export function CanvasAuthButton({ isAnonymous }: CanvasAuthButtonProps) {
  return (
    <div className="pointer-events-auto absolute top-4 right-4 z-10">
      {isAnonymous ? (
        <Button variant="outline" size="icon" className="rounded-full">
          <Link href="/login">
            <FloppyDiskIcon size={32} className="size-4" />
            <span className="sr-only">Save</span>
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href="/login">
            <UserIcon size={32} className="size-4" />
            <span className="sr-only">You</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
