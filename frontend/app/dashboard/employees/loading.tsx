import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <Skeleton className="h-10 w-full" />

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[100px]" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[100px]" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

