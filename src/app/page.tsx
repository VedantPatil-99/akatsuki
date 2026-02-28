import Link from "next/link";

import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <Link href="/board" className="flex text-blue-600 underline">
      Go to the board <ChalkboardTeacherIcon size={32} />
    </Link>
  );
}
