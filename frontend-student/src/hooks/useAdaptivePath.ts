import { useState, useEffect } from 'react';
import { DepthLevel } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LearningPath {
  studentId: string;
  recommendedDepth: DepthLevel;
  nextTopics: string[];
}

export const useAdaptivePath = (studentId: string) => {
    const [path, setPath] = useState<LearningPath | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPath = async (depth: DepthLevel = DepthLevel.Core) => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_URL}/api/adaptive/path/${studentId}?depth=${depth}`);
            const data = await response.json();
            if (data.success && data.data) {
                setPath(data.data);
            }
        } catch (err) {
            setError('Failed to fetch learning path');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPath();
    }, [studentId]);

    return { path, loading, error, refresh: fetchPath };
};
