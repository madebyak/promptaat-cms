'use client'

import { useState, useEffect, useMemo } from 'react';
import { ChangeLog } from '@/types/changeLog';
import { getChangeLogs, deleteChangeLog } from '@/lib/data/changeLogs';

// Hook for change log filtering
export function useFilteredChangeLogs(logs: ChangeLog[], searchQuery: string) {
  return useMemo(() => {
    return logs.filter(log => 
      searchQuery === '' || 
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);
}

// Main change logs hook
export function useChangeLogs() {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChangeLogs = async () => {
    try {
      const data = await getChangeLogs();
      setChangeLogs(data);
    } catch (error) {
      console.error('Failed to load change logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshChangeLogs = async () => {
    setLoading(true);
    await loadChangeLogs();
  };

  useEffect(() => {
    loadChangeLogs();
  }, []);

  const handleDelete = async (logId: string) => {
    try {
      const success = await deleteChangeLog(logId);
      if (success) {
        setChangeLogs(changeLogs.filter(log => log.id !== logId));
      } else {
        throw new Error('Failed to delete change log');
      }
    } catch (error) {
      console.error('Error deleting change log:', error);
      alert('Failed to delete change log. Please try again.');
    }
  };

  const stats = useMemo(() => {
    // Group logs by month for potential statistics
    const byMonth = changeLogs.reduce((acc, log) => {
      const date = new Date(log.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += 1;
      
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: changeLogs.length,
      byMonth
    };
  }, [changeLogs]);

  return {
    changeLogs,
    loading,
    handleDelete,
    refreshChangeLogs,
    stats
  };
}
