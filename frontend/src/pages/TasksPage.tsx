import { useEffect, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import type { TaskCreate, TaskFilters, TaskRead } from '../types'
import FilterBar from '../components/tasks/FilterBar'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function TasksPage() {
  const { tasks, loading, error, fetchTasks, addTask, editTask, removeTask } = useTasks()
  const [filters, setFilters] = useState<TaskFilters>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRead | undefined>(undefined)

  useEffect(() => {
    fetchTasks(filters)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (editingTask) {
      await editTask(editingTask.id, data)
    } else {
      await addTask(data)
    }
    closeModal()
  }

  async function handleStatusChange(id: number, status: TaskRead['status']) {
    await editTask(id, { status })
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate}>+ Add Task</Button>
      </div>

      {/* Filter bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Error */}
      {error && <div className="error-banner" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

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
              onDelete={removeTask}
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
