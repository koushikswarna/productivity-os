"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export default function TimelinePage() {
  const params = useParams()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Timeline View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>
            Timeline / Gantt view coming soon. Use Board or List view for now.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
