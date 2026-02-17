"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"

const kpiSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  target_value: z.number().min(0),
  unit: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  tracking_period: z.enum(["daily", "weekly", "monthly", "quarterly"]),
})

export function KPIForm({ onSuccess }: { onSuccess: () => void }) {
  const supabase = useSupabase()
  const { organization } = useOrg()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof kpiSchema>>({
    resolver: zodResolver(kpiSchema),
    defaultValues: { name: "", description: "", target_value: 0, unit: "", category: "", tracking_period: "monthly" },
  })

  const onSubmit = async (values: z.infer<typeof kpiSchema>) => {
    if (!organization) return
    setLoading(true)
    const { error } = await supabase.from("kpis").insert({ ...values, organization_id: organization.id })
    if (error) toast.error(error.message)
    else { toast.success("KPI created"); onSuccess() }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Revenue" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="target_value" render={({ field }) => (
            <FormItem><FormLabel>Target</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="unit" render={({ field }) => (
            <FormItem><FormLabel>Unit</FormLabel><FormControl><Input placeholder="$, %, tasks" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="Sales, Engineering" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="tracking_period" render={({ field }) => (
          <FormItem><FormLabel>Tracking Period</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create KPI"}</Button>
      </form>
    </Form>
  )
}
