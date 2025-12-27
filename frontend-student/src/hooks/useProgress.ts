import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { StudentProfile, LearningInsight } from '@/types';

export const useProgress = (studentId: string) => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [insights, setInsights] = useState<LearningInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProgress = async () => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        
        try {
            const response = await apiClient.progress.getSummary(studentId);
            if (response.success && response.data) {
                setProfile(response.data.profile);
                setInsights(response.data.insights || []);
            }
        } catch (err) {
            setError('Failed to fetch progress');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [studentId]);

    return { profile, insights, loading, error, refresh: fetchProgress };
};
