"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { FloppyDiskIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CanvasAuthButtonProps {
  isAnonymous: boolean;
  email?: string;
  avatarUrl?: string;
}

export function CanvasAuthButton({
  isAnonymous,
  email,
  avatarUrl,
}: CanvasAuthButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="pointer-events-auto absolute top-4 right-15 z-500 flex items-center gap-2">
      {isAnonymous ? (
        <Button
          asChild
          className={cn(
            "border-secondary-foreground/50 gap-2 rounded-full shadow-sm",
            "dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800",
            "bg-secondary text-neutral-800 hover:bg-neutral-200"
          )}
          variant="outline"
          size="default"
        >
          <Link href="/login">
            <FloppyDiskIcon weight="bold" className="size-4" />
            Save Work
          </Link>
        </Button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 py-1.5 pr-4 pl-2 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-50"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                height={24}
                width={24}
                className="size-6 rounded-full border border-zinc-200"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100">
                <UserIcon className="h-3.5 w-3.5 text-zinc-600" />
              </div>
            )}
            <span className="max-w-[120px] truncate text-sm font-medium text-zinc-700">
              {email?.split("@")[0] || "Account"}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3">
                <p className="text-xs font-medium text-zinc-500">
                  Signed in as
                </p>
                <p className="truncate text-sm font-medium text-zinc-900">
                  {email}
                </p>
              </div>
              <div className="p-1">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <SignOutIcon weight="bold" className="size-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
