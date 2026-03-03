import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  id: string;
  disabled?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailInput = ({
  id,
  disabled,
  error,
  onChange,
}: EmailInputProps) => {
  return (
    <div className="-my-1 grid gap-2">
      <Label
        htmlFor={id}
        className={cn(
          "transition-colors duration-500",
          error && "text-destructive"
        )}
      >
        Email address<span className="text-destructive -ml-1">*</span>
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
          onChange={onChange}
          className={cn(
            "peer hover:border-primary/50 pl-9 transition-[border-color] duration-300",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      <div
        className={cn(
          "min-h-0.5 transition-all duration-500 ease-in-out",
          error && "min-h-5 py-0.5"
        )}
      >
        <p
          className={cn(
            "text-destructive text-xs transition-opacity duration-700",
            error ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          {error}
        </p>
      </div>
    </div>
  );
};
