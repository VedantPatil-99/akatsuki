import Link from "next/link";

export default function Home() {
  return (
    <Link href="/board" className="text-blue-600 underline">
      Go to the board
    </Link>
  );
}
