import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        <Skeleton className="h-10 w-[100px] rounded-full" />
        <Skeleton className="h-10 w-[100px] rounded-full" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px] mt-2" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-[100px]" />
                ))}
              </div>

              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-[100px]" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

