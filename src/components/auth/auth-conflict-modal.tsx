"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ShieldWarningIcon, SignOutIcon } from "@phosphor-icons/react";

import { discardGuestAndLogin } from "@/app/actions/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AuthConflictModal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Derive state directly from the URL
  const isOpen = searchParams.get("conflict") === "existing_account";

  // 2. Close the modal by cleaning the URL
  const handleClose = () => {
    router.replace("/board", { scroll: false });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-center! items-center">
          <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <ShieldWarningIcon
              className="text-destructive size-6"
              weight="fill"
            />
          </div>
          <AlertDialogTitle>Account Already Exists</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            We found a permanent Akatsuki account linked to that Google email.
            If you switch accounts now, your current Guest whiteboard will be
            lost.
            <br />
            <br />
            <strong>Tip:</strong> Please export or download your current work
            before switching!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Acts as your "Stay here" button and cleanly closes the dialog */}
          <AlertDialogCancel onClick={handleClose} className="cursor-pointer">
            Stay here and save my work
          </AlertDialogCancel>

          {/* Wraps the Shadcn action in your server action form */}
          <form action={discardGuestAndLogin} className="m-0">
            <AlertDialogAction
              type="submit"
              variant="destructive"
              className="w-full cursor-pointer gap-2"
            >
              <SignOutIcon weight="bold" />
              Discard guest work & Log in
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
