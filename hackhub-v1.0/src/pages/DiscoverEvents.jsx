import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { Tabs } from '../components/ui/Tabs';
import { HackathonCard } from '../components/events/HackathonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { mockEventService } from '../services/mockEventService';
import { Compass } from 'lucide-react';

export const DiscoverEvents = () => {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const categories = [
    { id: 'All', label: 'All Hackathons' },
    { id: 'AI', label: 'AI & ML' },
    { id: 'Web', label: 'Web & Full Stack' },
    { id: 'Cybersecurity', label: 'Cybersecurity' },
    { id: 'IoT', label: 'IoT & Hardware' },
    { id: 'Open Innovation', label: 'Open Track' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await mockEventService.getAllHackathons(category, searchQuery);
        setEvents(data);
      } catch (error) {
        setEvents([]);
        setLoadError(error.message || 'Could not load hackathons.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discover Hackathons"
        subtitle="Find collegiate challenges, assemble your dream squad, and deliver impactful projects."
      />

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by event title, tech stack (e.g. React, LangChain), or organizer..."
          className="flex-1"
        />
      </div>

      <Tabs
        tabs={categories}
        activeTab={category}
        onChange={setCategory}
        variant="pills"
      />

      {/* Event Cards Grid */}
      {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <HackathonCard key={event.id} hackathon={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No Hackathons Found"
          description="Try adjusting your search terms or selecting a different category filter."
          actionText="Clear Filters"
          onAction={() => {
            setCategory('All');
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
