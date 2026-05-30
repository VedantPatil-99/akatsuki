import Link from "next/link";
import { redirect } from "next/navigation";

import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // 1. Catch the OAuth linking error
  if (searchParams.error_code === "identity_already_exists") {
    redirect("/board?conflict=existing_account");
  }

  // 2. Catch successful OAuth logins that fell back to the root URL
  if (searchParams.code) {
    redirect(`/api/auth/callback?code=${searchParams.code}`);
  }

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center text-cyan-600">
        <Link
          href="/board"
          className="flex items-center justify-center gap-2 text-blue-600 underline"
        >
          Go to the board
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChalkboardTeacherIcon size={32} />
                  <span className="sr-only">Go to the board</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-xs">
                Go to the board
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
    </>
  );
}
