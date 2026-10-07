import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { mockAiService } from '../services/mockAiService';
import {
  BookOpen,
  Bot,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const RulebookPage = () => {
  const [selectedSection, setSelectedSection] = useState('1.0');
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'msg_1',
      sender: 'user',
      text: 'Are external APIs and pre-trained LLM models allowed?'
    },
    {
      id: 'msg_2',
      sender: 'ai',
      text: 'Yes! External APIs and open-weight models (HuggingFace, Ollama) are allowed provided they have free accessible tiers and are declared in your repository README.',
      source: 'Rulebook v2 · Section 3.0 (Technology Restrictions)',
      confidence: 0.96
    }
  ]);

  const rulebookSections = [
    {
      id: '1.0',
      title: '1.0 Eligibility & Team Formation',
      content: 'All undergraduate and postgraduate college students with valid university ID cards are eligible. Teams must consist of 2 to 4 members. Inter-college teams are permitted for online challenges.'
    },
    {
      id: '2.0',
      title: '2.0 Originality & Code Authored',
      content: 'All project application code must be authored during the active hackathon sprint window. Pre-built UI boilerplates and open-source npm packages are allowed, but the core business logic, RAG pipelines, or APIs must be built during the event.'
    },
    {
      id: '3.0',
      title: '3.0 Technology Restrictions & Free Tiers',
      content: 'Projects must not rely on proprietary enterprise tiers that cannot be reproduced by jurors. Free tiers of cloud hosting (Vercel, Render, AWS Free Tier, Supabase) and open AI APIs are encouraged.'
    },
    {
      id: '4.0',
      title: '4.0 Submission Deliverables',
      content: 'Every team must submit: (1) Public GitHub repository with open source license, (2) Live deployed web application URL, (3) 2-minute video demonstration, (4) Slide deck presentation.'
    },
    {
      id: '5.0',
      title: '5.0 Jury Rubric & Evaluation Weightage',
      content: 'Evaluation is based on: Innovation (25%), Technical Architecture & Code Quality (30%), UI/UX & Design Polish (20%), Practical Impact & Demo (25%).'
    }
  ];

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { id: `u_${Date.now()}`, sender: 'user', text: userText }]);
    setIsAsking(true);

    const response = await mockAiService.askRulebook(userText);
    setChatHistory(prev => [
      ...prev,
      {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        source: response.source,
        confidence: response.confidence
      }
    ]);
    setIsAsking(false);
  };

  const currentSectionData = rulebookSections.find(s => s.id === selectedSection) || rulebookSections[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hackathon Rulebook & AI Assistant"
        subtitle="Review official event guidelines or ask our mock RAG assistant for instant clarifications."
        badge={<Badge variant="primary">Rulebook v2.1</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Rulebook Table of Contents & Content (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                <span>Official Guidelines & Sections</span>
              </h3>
              <span className="text-xs text-[#64748B]">Last updated 2 days ago</span>
            </div>

            {/* Section selector buttons */}
            <div className="flex flex-wrap gap-2">
              {rulebookSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedSection === sec.id
                      ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {sec.title.split(' ')[0]} {sec.title.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Selected Section Reader */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mt-4 space-y-2">
              <h4 className="font-bold text-base text-[#172033]">{currentSectionData.title}</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentSectionData.content}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Col: AI Rulebook Assistant (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="p-5 flex flex-col h-[560px] bg-white border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Ask the Rulebook</h3>
                  <p className="text-[11px] text-[#64748B]">RAG answers with source citations</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Mock AI</Badge>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {chatHistory.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[90%] ${
                      isUser ? 'bg-[#4F46E5] text-white rounded-tr-none' : 'bg-slate-100 text-[#172033] rounded-tl-none border border-slate-200/60'
                    }`}>
                      <p>{msg.text}</p>
                      {msg.source && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>Source: {msg.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isAsking && (
                <div className="p-3 bg-slate-100 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600 animate-spin" />
                  <span>Searching official rulebook sections...</span>
                </div>
              )}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleAsk} className="pt-3 border-t border-[#E2E8F0] flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about APIs, team sizes, deadlines..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
              <Button type="submit" variant="primary" size="sm" disabled={isAsking}>
                <Send size={14} />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
