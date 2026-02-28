import Link from "next/link";

import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
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
