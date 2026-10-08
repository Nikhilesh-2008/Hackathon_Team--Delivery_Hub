import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage = () => {
  const { showSuccess } = useToast();
  const [settings, setSettings] = useState({
    profileVisible: true,
    emailNotifications: true,
    invitationAlerts: true,
    autoApproveTeammates: false,
    theme: 'system'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showSuccess("Preference updated");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account & Workspace Settings"
        subtitle="Manage privacy, notification frequency, and profile discovery preferences."
      />

      {/* Privacy & Discovery Settings */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0] flex items-center gap-2">
          <User size={18} className="text-indigo-600" />
          <span>Profile Discovery & Matchmaking</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <p className="font-semibold text-xs sm:text-sm text-[#172033]">Discoverable on Team Finder</p>
              <p className="text-xs text-[#64748B]">Allow student team captains to discover your profile and send invitations.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.profileVisible}
              onChange={() => handleToggle('profileVisible')}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <p className="font-semibold text-xs sm:text-sm text-[#172033]">Instant Invitation Alerts</p>
              <p className="text-xs text-[#64748B]">Receive real-time toasts and badges when invited to a squad.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.invitationAlerts}
              onChange={() => handleToggle('invitationAlerts')}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300"
            />
          </label>
        </div>
      </Card>

      {/* Application State & Demo Reset */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0] flex items-center gap-2">
          <Shield size={18} className="text-emerald-600" />
          <span>Demo Data Management</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="font-bold text-xs sm:text-sm text-[#172033]">Reset Mock LocalStorage</p>
            <p className="text-xs text-[#64748B]">Reverts all demo data, tasks, and team changes back to initial state.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-red-600 hover:bg-red-50"
          >
            Reset All Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
