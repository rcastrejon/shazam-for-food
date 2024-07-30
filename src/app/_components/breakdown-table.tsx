import * as m from "~/paraglide/messages.js";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

function InfinityTable({ children }: React.PropsWithChildren) {
  return (
    <div className="-mx-4 mt-2 overflow-x-auto sm:mx-0">
      <div className="border-y sm:rounded-lg sm:border-x">
        <Table>{children}</Table>
      </div>
    </div>
  );
}

export type TableSchema = {
  ingredients: string;
  portions: string;
  calories: number;
};

export function BreakdownTable({
  description,
  rows,
}: {
  description: string | undefined;
  rows: TableSchema[] | undefined;
}) {
  const hasContent = description !== undefined || rows !== undefined;
  if (!hasContent) {
    return (
      <div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[128px] rounded bg-foreground/20" />
          <Skeleton className="h-4 w-full rounded bg-foreground/20" />
        </div>
        <InfinityTable>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-[128px] rounded bg-muted-foreground/20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[128px] rounded bg-foreground/20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[128px] rounded bg-foreground/20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[128px] rounded bg-foreground/20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </InfinityTable>
      </div>
    );
  }
  return (
    <div>
      <h2 className="font-semibold">{m.c_breakdown_table_title()}</h2>
      <p className="text-sm">{description}</p>
      <InfinityTable>
        <TableHeader>
          <TableRow>
            <TableHead>{m.c_breakdown_table_ingredients()}</TableHead>
            <TableHead>{m.c_breakdown_table_portions()}</TableHead>
            <TableHead>{m.c_breakdown_table_calories()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows?.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.ingredients}</TableCell>
              <TableCell>{row.portions}</TableCell>
              <TableCell>{row.calories}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>
              {rows?.reduce((acc, row) => acc + row.calories, 0)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </InfinityTable>
    </div>
  );
}
