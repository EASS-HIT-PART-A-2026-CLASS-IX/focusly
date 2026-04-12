import { useEffect, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useToast } from '../context/ToastContext'
import { useTaskCount } from '../context/TaskCountContext'
import { exportTasksToCSV } from '../utils/exporters'
import type { TaskCreate, TaskFilters, TaskRead } from '../types'
import FilterBar from '../components/tasks/FilterBar'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function TasksPage() {
  const { tasks, loading, fetchTasks, addTask, editTask, removeTask } = useTasks()
  const { addToast } = useToast()
  const { setCount } = useTaskCount()
  const [filters, setFilters] = useState<TaskFilters>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRead | undefined>(undefined)

  useEffect(() => {
    fetchTasks(filters).catch(e => addToast((e as Error).message, 'error'))
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCount(tasks.length)
  }, [tasks.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingTask(undefined)
    setModalOpen(true)
  }

  function openEdit(task: TaskRead) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingTask(undefined)
  }

  async function handleSave(data: TaskCreate) {
    try {
      if (editingTask) {
        await editTask(editingTask.id, data)
        addToast('Task updated', 'success')
      } else {
        await addTask(data)
        addToast('Task created', 'success')
      }
      closeModal()
    } catch (e) {
      addToast((e as Error).message, 'error')
    }
  }

  async function handleStatusChange(id: number, status: TaskRead['status']) {
    try {
      await editTask(id, { status })
      if (status === 'done') addToast('Task marked as done', 'success')
    } catch (e) {
      addToast((e as Error).message, 'error')
    }
  }

  async function handleDelete(id: number) {
    try {
      await removeTask(id)
      addToast('Task deleted', 'info')
    } catch (e) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                exportTasksToCSV(tasks)
                addToast(`Exported ${tasks.length} task${tasks.length !== 1 ? 's' : ''} to CSV`, 'success')
              }}
            >
              ↓ Export CSV
            </Button>
          )}
          <Button onClick={openCreate}>+ Add Task</Button>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Filter bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          message="No tasks found. Add your first task to get started."
          actionLabel="+ Add Task"
          onAction={openCreate}
        />
      ) : (
        <div
          className="fade-up"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  )
}
