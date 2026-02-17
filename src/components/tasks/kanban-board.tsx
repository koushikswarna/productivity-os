"use client"
import { useState, useCallback } from "react"
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { TaskCard } from "./task-card"
import { KanbanColumn } from "./kanban-column"
import type { TaskWithAssignee, TaskStatus } from "@/lib/types"

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "in_review", title: "In Review", color: "bg-yellow-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
]

interface KanbanBoardProps {
  tasks: TaskWithAssignee[]
  onTasksChange: (tasks: TaskWithAssignee[]) => void
  projectId: string
  onRefresh: () => void
}

export function KanbanBoard({ tasks, onTasksChange, projectId, onRefresh }: KanbanBoardProps) {
  const supabase = useSupabase()
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return
    // Check if over is a column
    const overColumn = COLUMNS.find((c) => c.id === overId)
    if (overColumn && activeTask.status !== overColumn.id) {
      onTasksChange(tasks.map((t) => t.id === activeId ? { ...t, status: overColumn.id } : t))
    }
    // Check if over is a task in a different column
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      onTasksChange(tasks.map((t) => t.id === activeId ? { ...t, status: overTask.status } : t))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (!task) return
    // Update in database
    await supabase.from("tasks").update({ status: task.status, position: task.position }).eq("id", task.id)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <KanbanColumn key={column.id} id={column.id} title={column.title} color={column.color} count={columnTasks.length}>
              <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onRefresh={onRefresh} />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} onRefresh={onRefresh} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}
