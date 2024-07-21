import { Info } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export function SelectionContainer({
  children,
  enabled,
}: React.PropsWithChildren<{
  enabled: boolean;
}>) {
  return (
    <div>
      <div className="flex items-center text-muted-foreground">
        <Info className="mr-4 h-5 w-5 fill-muted" />
        <div className="space-y-1">
          <h5 className="text-sm leading-none tracking-tight text-muted-foreground">
            Additional information required!
          </h5>
          <p className="text-xs text-muted-foreground">
            Please select <span className="underline">all</span> the options
            that apply to your dish:
          </p>
        </div>
      </div>
      <form className="mt-2 grid space-y-2">
        {children}
        <Button disabled={!enabled}>Submit</Button>
      </form>
    </div>
  );
}

export function SelectionItem({ label }: { label: string }) {
  return (
    <div className="flex flex-row items-center space-x-4 rounded-lg px-4 py-3 transition-all has-[:checked]:bg-accent sm:has-[:checked]:bg-transparent">
      <Checkbox id={label} name={label} />
      <label className="cursor-pointer text-sm" htmlFor={label}>
        {label}
      </label>
    </div>
  );
}
