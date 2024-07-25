import * as m from "~/paraglide/messages.js";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function BreakdownTable({
  description,
  children,
}: React.PropsWithChildren<{
  description: string;
}>) {
  return (
    <div>
      <h2 className="font-semibold tracking-tight">
        {m.c_breakdown_table_title()}
      </h2>
      <p className="text-sm">{description}</p>
      <div className="-mx-4 mt-2 overflow-x-auto sm:mx-0">
        <div className="border-y sm:rounded-lg sm:border-x">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{m.c_breakdown_table_ingredients()}</TableHead>
                <TableHead>{m.c_breakdown_table_portions()}</TableHead>
                <TableHead>{m.c_breakdown_table_calories()}</TableHead>
              </TableRow>
            </TableHeader>
            {children}
          </Table>
        </div>
      </div>
    </div>
  );
}

export function BreakdownTablePlaceholderRows({ n }: { n: number }) {
  return new Array(n).fill(0).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-[128px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[128px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[128px]" />
      </TableCell>
    </TableRow>
  ));
}
