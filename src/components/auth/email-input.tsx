import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  id: string;
  disabled?: boolean;
}

export const EmailInput = ({ id, disabled }: EmailInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Email</Label>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <EnvelopeSimpleIcon className="size-4" weight="bold" />
        </div>
        <Input
          id={id}
          name="email"
          type="email"
          placeholder="teacher@school.edu"
          required
          disabled={disabled}
          className="peer pl-9"
        />
      </div>
    </div>
  );
};
