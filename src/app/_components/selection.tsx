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
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto,_1fr] text-muted-foreground">
        <div className="row-span-2 flex items-center">
          <Info className="mr-4 h-4 w-4" />
        </div>
        <h5 className="text-sm leading-none tracking-tight text-muted-foreground">
          Additional information required!
        </h5>
        <p className="mt-1 text-xs text-muted-foreground">
          Please select <span className="underline">all</span> the options that
          apply to your meal:
        </p>
      </div>
      <form className="mt-2 grid">
        <div className="space-y-2">{children}</div>
        <Button className="mt-2 sm:hidden" type="submit" disabled={!enabled}>
          Submit
        </Button>
        <Button
          className="mt-4 hidden w-fit px-8 sm:block"
          type="submit"
          size="sm"
          disabled={!enabled}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}

export function SelectionItem({ label }: { label: string }) {
  return (
    <div className="flex items-center space-x-4 rounded-lg px-4 py-3 transition-colors has-[:checked]:bg-accent sm:px-0 sm:py-0 sm:has-[:checked]:bg-transparent">
      <Checkbox id={label} name={label} />
      <label className="cursor-pointer text-sm" htmlFor={label}>
        {label}
      </label>
    </div>
  );
}
