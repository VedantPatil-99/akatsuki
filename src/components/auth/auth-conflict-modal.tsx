"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ShieldWarningIcon, SignOutIcon, XIcon } from "@phosphor-icons/react";

import { discardGuestAndLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function AuthConflictModal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Derive state directly from the URL. No useEffect needed!
  const isOpen = searchParams.get("conflict") === "existing_account";

  // 2. Close the modal by cleaning the URL
  const handleClose = () => {
    router.replace("/board", { scroll: false });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
        >
          <XIcon size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <ShieldWarningIcon size={28} className="text-amber-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-zinc-900">
            Account Already Exists
          </h2>
          <p className="mb-6 text-sm text-zinc-600">
            We found a permanent Akatsuki account linked to that Google email.
            If you switch accounts now, your current Guest whiteboard will be
            lost.
            <br />
            <br />
            <strong>Tip:</strong> Please export or download your current work
            before switching!
          </p>

          <div className="flex w-full flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-zinc-200"
            >
              Stay here and save my work
            </Button>

            <form action={discardGuestAndLogin} className="w-full">
              <Button
                type="submit"
                variant="destructive"
                className="w-full gap-2"
              >
                <SignOutIcon weight="bold" />
                Discard guest work & Log in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
