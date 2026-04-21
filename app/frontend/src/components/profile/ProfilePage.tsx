import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { updateMe } from '@/lib/api';
import type { AuthUser } from '@/types/auth';

type ProfilePageProps = {
  user: AuthUser;
  onUpdate: () => Promise<void>;
};

export function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const { toast, setToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    displayName: user.profile?.displayName || '',
    zipCode: user.profile?.zipCode || '',
    sobrietyDate: user.profile?.sobrietyDate ? new Date(user.profile.sobrietyDate).toISOString().split('T')[0] : '',
    phone: user.profile?.phone || '',
    timezone: user.profile?.timezone || '',
    theme: user.preferences?.theme || 'light',
    wantsReminders: user.preferences?.wantsReminders ?? true,
    wantsPeerSupport: user.preferences?.wantsPeerSupport ?? true,
    dailyCheckinHour: user.preferences?.dailyCheckinHour || 9,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateMe(localStorage.getItem('newera-recovery-auth') ? JSON.parse(localStorage.getItem('newera-recovery-auth')!).accessToken : '', {
        ...formData,
        sobrietyDate: formData.sobrietyDate ? new Date(formData.sobrietyDate).toISOString() : null,
      });

      await onUpdate();
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Your Profile</h1>
        <p className="mt-2 text-slate-600">Manage your personal information and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Personal Information</h2>
              <p className="mt-1 text-sm text-slate-600">Your basic profile details.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>

            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="How you'd like to be known"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <Input
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>

            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              placeholder="America/New_York"
            />

            <Input
              label="Sobriety Date"
              type="date"
              value={formData.sobrietyDate}
              onChange={(e) => handleChange('sobrietyDate', e.target.value)}
            />
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Preferences</h2>
              <p className="mt-1 text-sm text-slate-600">Customize your recovery experience.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.wantsReminders}
                  onChange={(e) => handleChange('wantsReminders', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Receive daily check-in reminders</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.wantsPeerSupport}
                  onChange={(e) => handleChange('wantsPeerSupport', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Enable peer support features</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Daily Check-in Reminder Time
              </label>
              <select
                value={formData.dailyCheckinHour}
                onChange={(e) => handleChange('dailyCheckinHour', parseInt(e.target.value))}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {toast && (
        <div className={`fixed bottom-4 right-4 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}
    </motion.div>
  );
}