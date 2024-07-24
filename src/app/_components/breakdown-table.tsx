import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function BreakdownTable({ children }: React.PropsWithChildren) {
  return (
    <div className="-mx-4 mt-2 overflow-x-auto sm:mx-0">
      <div className="border-y sm:rounded-lg sm:border-x">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredients</TableHead>
              <TableHead>Portions</TableHead>
              <TableHead>Calories</TableHead>
            </TableRow>
          </TableHeader>
          {children}
        </Table>
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
