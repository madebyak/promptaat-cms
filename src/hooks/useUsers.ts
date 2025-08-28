'use client'

import { useState, useEffect, useMemo } from 'react';
import { User } from '@/types/user';
import { getUsers, deleteUser } from '@/lib/data/users';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
  proUsers: number;
  totalPosts: number;
  totalLikedPrompts: number;
  totalLikedKits: number;
  totalPromptReviews: number;
  totalKitReviews: number;
  totalCollections: number;
  roleCount: Record<string, number>;
}

// Hook for user filtering
export function useFilteredUsers(
  users: User[], 
  searchQuery: string, 
  roleFilter: string, 
  statusFilter: string, 
  accountTypeFilter: string = ''
) {
  return useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      const matchesAccountType = accountTypeFilter === '' || user.accountType === accountTypeFilter;
      
      return matchesSearch && matchesRole && matchesStatus && matchesAccountType;
    });
  }, [users, searchQuery, roleFilter, statusFilter, accountTypeFilter]);
}

// Main users hook
export function useUsers(): { users: User[], loading: boolean, handleDelete: (userId: number) => Promise<void>, stats: UserStats } {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        const data = await getUsers();
        setUsers(data);
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const stats = useMemo<UserStats>(() => {
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const blockedUsers = users.filter(u => u.status === 'blocked').length;
    const proUsers = users.filter(u => u.accountType === 'pro').length;
    const totalPosts = users.reduce((sum, u) => sum + (u.postCount || 0), 0);
    const totalLikedPrompts = users.reduce((sum, u) => sum + (u.likedPrompts || 0), 0);
    const totalLikedKits = users.reduce((sum, u) => sum + (u.likedKits || 0), 0);
    const totalPromptReviews = users.reduce((sum, u) => sum + (u.promptReviews || 0), 0);
    const totalKitReviews = users.reduce((sum, u) => sum + (u.kitReviews || 0), 0);
    const totalCollections = users.reduce((sum, u) => sum + (u.collections || 0), 0);
    
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      proUsers,
      totalPosts,
      totalLikedPrompts,
      totalLikedKits,
      totalPromptReviews,
      totalKitReviews,
      totalCollections,
      roleCount
    };
  }, [users]);

  return {
    users,
    loading,
    handleDelete,
    stats
  };
}