import { Info } from "lucide-react";
import { z } from "zod";

import * as m from "~/paraglide/messages.js";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export function Suggestions({
  children,
  isGenerating,
  submitSuggestions,
}: React.PropsWithChildren<{
  isGenerating: boolean;
  submitSuggestions: (suggestions: string[]) => Promise<void>;
}>) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const schema = z.record(z.string(), z.literal("on"));
    const formData = new FormData(e.currentTarget);
    const values = schema.parse(Object.fromEntries(formData.entries()));
    await submitSuggestions(Object.keys(values));
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto,_1fr] text-muted-foreground">
        <div className="row-span-2 flex items-center">
          <Info className="mr-4 h-4 w-4" />
        </div>
        <h5 className="text-sm leading-none tracking-tight text-muted-foreground">
          {m.c_suggestions_title()}
        </h5>
        <p className="mt-1 text-xs text-muted-foreground">
          {m.c_suggestions_description()}
        </p>
      </div>
      <form className="mt-2 grid" onSubmit={handleSubmit}>
        <div className="space-y-2">{children}</div>
        <Button
          className="mt-2 sm:hidden"
          type="submit"
          disabled={isGenerating}
        >
          {m.c_suggestions_submit()}
        </Button>
        <Button
          className="mt-4 hidden w-fit px-8 sm:block"
          type="submit"
          size="sm"
          disabled={isGenerating}
        >
          {m.c_suggestions_submit()}
        </Button>
      </form>
    </div>
  );
}

export function SuggestionsCheckbox({ label }: { label: string }) {
  return (
    <div className="flex items-center space-x-4 rounded-lg px-4 py-3 transition-colors has-[:checked]:bg-accent sm:px-0 sm:py-0 sm:has-[:checked]:bg-transparent">
      <Checkbox id={label} name={label} />
      <label className="cursor-pointer text-sm" htmlFor={label}>
        {label}
      </label>
    </div>
  );
}
