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
    <div className="pointer-events-auto relative flex items-center">
      {isAnonymous ? (
        <Button
          asChild
          className={cn(
            "border-secondary-foreground/50 gap-1.5 rounded-full shadow-sm transition-all sm:gap-2",
            "dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800",
            "bg-secondary text-neutral-800 hover:bg-neutral-200"
          )}
          variant="outline"
          size="default"
        >
          <Link href="/login">
            <FloppyDiskIcon weight="bold" className="size-4" />
            <span className="hidden font-medium sm:inline">Save Work</span>
          </Link>
        </Button>
      ) : (
        <>
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-expanded={showMenu}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full border shadow-sm backdrop-blur-md transition-all",
              "border-secondary-foreground/50 bg-secondary/90 hover:bg-secondary",
              "dark:bg-neutral-900/90 dark:hover:bg-neutral-800",
              "p-1 sm:py-1.5 sm:pr-4 sm:pl-1.5"
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                height={28}
                width={28}
                className="border-border size-7 rounded-full border object-cover sm:size-6"
              />
            ) : (
              <div className="bg-muted border-border flex size-7 items-center justify-center rounded-full border sm:size-6">
                <UserIcon className="text-muted-foreground size-4" />
              </div>
            )}
            <span className="text-foreground hidden max-w-24 truncate text-sm font-medium sm:inline-block lg:max-w-32">
              {email?.split("@")[0] || "Account"}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="animate-in fade-in slide-in-from-top-2 bg-background absolute top-full right-0 mt-2 w-48 overflow-hidden rounded-xl border shadow-xl dark:border-neutral-800">
              <div className="bg-muted/50 border-b px-4 py-3 dark:border-neutral-800">
                <p className="text-muted-foreground text-xs font-medium">
                  Signed in as
                </p>
                <p className="text-foreground truncate text-sm font-medium">
                  {email}
                </p>
              </div>
              <div className="p-1">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <SignOutIcon weight="bold" className="size-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
