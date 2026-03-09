import { CheckFatIcon } from "@phosphor-icons/react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const AuthSuccess = ({ text }: { text: string }) => {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <CheckFatIcon className="size-16 text-green-500" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  );
};
