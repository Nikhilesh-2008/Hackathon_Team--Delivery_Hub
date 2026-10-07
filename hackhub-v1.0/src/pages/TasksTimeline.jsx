import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { useTeam } from '../context/TeamContext';
import { mockTimeline } from '../data/teams';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const TasksTimeline = () => {
  const { tasks, updateTaskStatus, addTask } = useTeam();
  const [activeTab, setActiveTab] = useState('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('Karthik');
  const [newTaskPriority, setNewTaskPriority] = useState('High');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Tomorrow');
  const [newTaskTag, setNewTaskTag] = useState('Backend');

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-300 bg-slate-50/60' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-300 bg-indigo-50/30' },
    { id: 'BLOCKED', title: 'Blocked', color: 'border-red-300 bg-red-50/30' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-300 bg-emerald-50/30' }
  ];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      owner: newTaskOwner,
      priority: newTaskPriority,
      deadline: newTaskDeadline,
      tag: newTaskTag,
      description: 'Sprint milestone deliverable'
    });

    setNewTaskTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprint Tasks & Timeline"
        subtitle="Track team deliverables, unblock bottlenecks, and ensure everything ships before Sunday."
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5"
        >
          <Plus size={15} />
          <span>Add Task</span>
        </Button>
      </PageHeader>

      <Tabs
        tabs={[
          { id: 'board', label: 'Kanban Sprint Board' },
          { id: 'timeline', label: 'Sprint Timeline' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Kanban Board */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#172033]">{col.title}</span>
                    <span className="w-5 h-5 rounded-full bg-white text-[#172033] text-xs font-bold flex items-center justify-center shadow-xs">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <Card key={t.id} className="p-4 bg-white shadow-xs border-[#E2E8F0] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={
                            t.priority === 'High' ? 'danger' :
                            t.priority === 'Medium' ? 'warning' : 'default'
                          }
                          size="sm"
                        >
                          {t.priority} Priority
                        </Badge>
                        <Badge variant="outline" size="sm">{t.tag}</Badge>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-[#172033] leading-snug">
                        {t.title}
                      </h4>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={t.owner} size="xs" />
                          <span className="font-medium text-[#172033]">{t.owner}</span>
                        </div>
                        <span className="text-[11px] font-medium text-amber-700">Due {t.deadline}</span>
                      </div>

                      {/* Quick status transition dropdown/buttons */}
                      <div className="pt-2 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Move:</span>
                        <select
                          value={t.status}
                          onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="BLOCKED">Blocked</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Vertical Timeline */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="pb-4 mb-6 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#172033]">48-Hour Sprint Roadmap</h3>
            <p className="text-xs text-[#64748B]">Scheduled sprint milestones leading up to submission</p>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {mockTimeline.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Node icon */}
                <span className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                  item.status === 'completed' ? 'bg-emerald-500 text-white' :
                  item.status === 'in_progress' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {item.status === 'completed' ? '✓' : idx + 1}
                </span>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600">{item.day} · {item.date}</span>
                    <Badge
                      variant={
                        item.status === 'completed' ? 'success' :
                        item.status === 'in_progress' ? 'primary' : 'default'
                      }
                      size="sm"
                    >
                      {item.status === 'completed' ? 'Delivered' : item.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-[#172033]">{item.title}</h4>
                  <p className="text-xs text-[#64748B]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Sprint Task"
        description="Assign deliverable to a team member with deadline."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Name"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Integrate WebSocket telemetry listener"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Assignee</label>
              <select
                value={newTaskOwner}
                onChange={(e) => setNewTaskOwner(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Karthik">Karthik (Backend)</option>
                <option value="Rahul Sharma">Rahul (Frontend)</option>
                <option value="Ananya Iyer">Ananya (UI/UX)</option>
                <option value="Vivek Patel">Vivek (AI/ML)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deadline"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              placeholder="e.g. Oct 14 · 6 PM"
            />
            <Input
              label="Tag / Track"
              value={newTaskTag}
              onChange={(e) => setNewTaskTag(e.target.value)}
              placeholder="e.g. Frontend / AI"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
