import { Skeleton } from "./Skeleton";

export function DataTableSkeleton({ columns, rows = 10 }: { columns: number, rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[150px]" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-border">
          <div className="bg-muted/50">
            <div className="flex">
              {[...Array(columns)].map((_, i) => (
                <div key={i} className="flex-1 px-6 py-3">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="flex">
                {[...Array(columns)].map((_, j) => (
                  <div key={j} className="flex-1 px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
