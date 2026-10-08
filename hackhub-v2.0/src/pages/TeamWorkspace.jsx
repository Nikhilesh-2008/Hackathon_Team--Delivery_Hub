import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Award,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { useTeam } from '../context/TeamContext';

export const TeamWorkspace = () => {
  const { currentTeam, tasks, updateTaskStatus } = useTeam();
  const [activeTab, setActiveTab] = useState('members');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(currentTeam?.chatMessages || []);

  const tabs = [
    { id: 'members', label: `Members (${currentTeam?.members?.length || 4})` },
    { id: 'decisions', label: 'Technical Decisions' },
    { id: 'chat', label: 'Team Chat' },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: "usr_karthik",
      senderName: "Karthik",
      text: chatInput.trim(),
      timestamp: "Just now"
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentTeam?.name || "Team Nova"}
        subtitle={`Competing in ${currentTeam?.hackathonTitle || "NexusHack 2026"}`}
        badge={<Badge variant="primary" size="md">Sprint Active</Badge>}
      >
        <NavLink to="/ai-planner">
          <Button size="sm" variant="secondary" className="gap-1.5 text-indigo-700 border-indigo-200">
            <Sparkles size={15} />
            <span>AI Delivery Planner</span>
          </Button>
        </NavLink>
        <NavLink to="/team/submission">
          <Button size="sm" variant="primary">
            Submit Project
          </Button>
        </NavLink>
      </PageHeader>

      {/* Team Target & Progress Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Target Challenge</span>
            <h2 className="text-lg font-bold text-[#172033] mt-0.5">{currentTeam?.challengeTitle}</h2>
            <p className="text-xs text-[#64748B] mt-1">{currentTeam?.description}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-[#64748B]">Sprint Readiness</span>
            <p className="text-2xl font-black text-[#172033]">{currentTeam?.progress || 72}%</p>
          </div>
        </div>

        <div className="pt-4">
          <ProgressBar value={currentTeam?.progress || 72} size="md" color="primary" />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Members */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentTeam?.members?.map((member) => (
            <Card key={member.id} className="p-5 flex flex-col justify-between text-center items-center">
              <div>
                <Avatar name={member.name} size="lg" className="mb-3" />
                <h4 className="font-bold text-base text-[#172033]">{member.name}</h4>
                <p className="text-xs text-[#64748B] mb-2">{member.role}</p>

                {member.isCaptain && (
                  <Badge variant="primary" size="sm" className="mb-3">Team Captain</Badge>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 text-left p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Tasks:</span>
                    <span className="font-bold text-[#172033]">{member.taskCount || 4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Availability:</span>
                    <span className="font-bold text-[#172033]">{member.availability}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {member.skills?.map((s) => (
                    <Badge key={s} variant="default" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Technical Decisions */}
      {activeTab === 'decisions' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#172033]">Architecture & Decision Log</h3>
              <p className="text-xs text-[#64748B]">Document key technical choices for judges and mentors</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentTeam?.technicalDecisions?.map((dec) => (
              <div key={dec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">{dec.title}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Proposed by {dec.author} · {dec.date}</p>
                </div>
                <Badge variant={dec.status === 'Approved' ? 'success' : 'warning'}>
                  {dec.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Team Chat */}
      {activeTab === 'chat' && (
        <Card className="p-5 flex flex-col h-[500px]">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#172033]">Team Sprint Channel</h3>
            <p className="text-xs text-[#64748B]">Real-time mock coordination for Team Nova</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((m) => {
              const isMe = m.senderId === "usr_karthik";
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={m.senderName} size="sm" />
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm ${
                    isMe ? 'bg-[#4F46E5] text-white rounded-tr-none' : 'bg-slate-100 text-[#172033] rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs">{m.senderName}</span>
                      <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{m.timestamp}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E2E8F0] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to team members..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
            />
            <Button type="submit" variant="primary" size="sm">
              <Send size={15} />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
