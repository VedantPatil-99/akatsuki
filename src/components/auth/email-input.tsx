import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  id: string;
  disabled?: boolean;
  error?: string;
}

export const EmailInput = ({ id, disabled, error }: EmailInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className={error ? "text-destructive" : ""}>
        Email
      </Label>
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
          aria-invalid={!!error}
          className={cn(
            "peer pl-9",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      {error && (
        <p className="text-destructive peer-aria-invalid:text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
};
