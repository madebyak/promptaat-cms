'use client'

import { useState, useEffect, useMemo } from 'react';
import { Admin, AdminRole } from '@/types/admin';
import { getAdmins, deleteAdmin } from '@/lib/data/admins';

// Hook for admin filtering
export function useFilteredAdmins(admins: Admin[], searchQuery: string, roleFilter: string) {
  return useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = searchQuery === '' || 
        admin.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === '' || admin.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, roleFilter]);
}

// Main admins hook
export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleDelete = async (adminId: string) => {
    try {
      const success = await deleteAdmin(adminId);
      if (success) {
        // Reload admins data to refresh the list
        await loadAdmins();
      } else {
        throw new Error('Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error; // Let the component handle the error display
    }
  };

  const refreshAdmins = () => {
    loadAdmins();
  };

  const stats = useMemo(() => {
    const roleCount = admins.reduce((acc, admin) => {
      acc[admin.role] = (acc[admin.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAdmins: admins.length,
      roleCount,
      superAdminCount: roleCount.super_admin || 0,
      contentAdminCount: roleCount.content_admin || 0,
      moderatorCount: roleCount.moderator || 0
    };
  }, [admins]);

  return {
    admins,
    loading,
    handleDelete,
    refreshAdmins,
    stats
  };
}
