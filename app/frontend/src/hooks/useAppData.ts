import { useEffect, useState } from 'react';
import {
  createCheckin,
  createMilestone,
  getCheckins,
  getCrisisPlan,
  getMilestones,
  getRecoveryPlan,
  saveCrisisPlan,
  saveRecoveryPlan
} from '@/lib/api';
import type { CheckinRecord } from '@/types/checkin';
import type { CrisisPlan } from '@/types/crisis-plan';
import type { Milestone } from '@/types/milestone';
import type { RecoveryPlan } from '@/types/recovery-plan';

export function useAppData(token?: string) {
  const [loading, setLoading] = useState(false);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  const [crisisPlan, setCrisisPlan] = useState<CrisisPlan | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const hydrate = async () => {
    if (!token) {
      setCheckins([]);
      setRecoveryPlan(null);
      setCrisisPlan(null);
      setMilestones([]);
      return;
    }

    setLoading(true);
    try {
      const [checkinsResponse, recoveryResponse, crisisResponse, milestonesResponse] = await Promise.all([
        getCheckins(token),
        getRecoveryPlan(token),
        getCrisisPlan(token),
        getMilestones(token)
      ]);
      setCheckins(checkinsResponse || []);
      setRecoveryPlan(recoveryResponse || null);
      setCrisisPlan(crisisResponse || null);
      setMilestones(milestonesResponse || []);
    } catch {
      setCheckins([]);
      setRecoveryPlan(null);
      setCrisisPlan(null);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void hydrate();
  }, [token]);

  const submitCheckin = async (payload: Partial<CheckinRecord>) => {
    if (!token) return null;
    const checkin = await createCheckin(token, payload);
    setCheckins((current) => [checkin, ...current]);
    return { checkin };
  };

  const submitRecoveryPlan = async (payload: RecoveryPlan) => {
    if (!token) return null;
    const response = await saveRecoveryPlan(token, payload);
    setRecoveryPlan(response);
    return response;
  };

  const submitCrisisPlan = async (payload: CrisisPlan) => {
    if (!token) return null;
    const response = await saveCrisisPlan(token, payload);
    setCrisisPlan(response);
    return response;
  };

  const createNewMilestone = async (payload: Omit<Milestone, 'id' | 'achievedAt'>) => {
    if (!token) return null;
    const milestone = await createMilestone(token, payload);
    setMilestones((current) => [milestone, ...current]);
    return milestone;
  };

  return {
    loading,
    data: {
      checkins,
      recoveryPlan,
      crisisPlan,
      milestones,
      submitCheckin,
      submitRecoveryPlan,
      submitCrisisPlan,
      createNewMilestone,
      refresh: hydrate
    }
  };
}
