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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Ingredients</TableHead>
          <TableHead className="text-center">Portions</TableHead>
          <TableHead className="text-center">Calories</TableHead>
        </TableRow>
      </TableHeader>
      {children}
    </Table>
  );
}

export function BreakdownTablePlaceholderRows({ n }: { n: number }) {
  return new Array(n).fill(0).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="mx-auto h-4 w-[128px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-4 w-[128px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-4 w-[128px]" />
      </TableCell>
    </TableRow>
  ));
}
