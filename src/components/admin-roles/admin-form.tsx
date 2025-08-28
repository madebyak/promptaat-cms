'use client'

import { useState } from 'react';
import { Admin, AdminRole } from '@/types/admin';
import { X } from 'lucide-react';

interface AdminFormProps {
  initialAdmin?: Partial<Admin>;
  onSubmit: (admin: Partial<Admin>) => Promise<void>;
  onCancel: () => void;
  currentUserRole: AdminRole;
  createdById: string | null;
  createdByName: string;
}

export function AdminForm({
  initialAdmin,
  onSubmit,
  onCancel,
  currentUserRole,
  createdById,
  createdByName
}: AdminFormProps) {
  const [admin, setAdmin] = useState<Partial<Admin>>(
    initialAdmin || { 
      role: 'moderator', // Default role
      created_by: createdById || undefined,
      created_by_name: createdById ? createdByName : undefined
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine which roles the current user can assign
  const availableRoles: AdminRole[] = (() => {
    switch (currentUserRole) {
      case 'super_admin':
        return ['super_admin', 'content_admin', 'moderator'];
      case 'content_admin':
        return ['moderator'];
      default:
        return [];
    }
  })();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setAdmin({
      ...admin,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!admin.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!admin.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!admin.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!admin.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...admin,
        created_by: createdById || undefined,
        created_by_name: createdById ? createdByName : undefined
      });
    } catch (error) {
      console.error('Error submitting admin form:', error);
      alert('Failed to save admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {initialAdmin ? 'Edit Admin' : 'Add New Admin'}
        </h2>
        <button 
          onClick={onCancel}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={admin.email || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
              }`}
              placeholder="admin@example.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={admin.role || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                errors.role ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
              }`}
              required
            >
              <option value="">Select a role</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="first_name">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={admin.first_name || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                errors.first_name ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
              }`}
              placeholder="First Name"
              required
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="last_name">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={admin.last_name || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                errors.last_name ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
              }`}
              placeholder="Last Name"
              required
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
          
          {/* This would typically be handled through a system process in a real app */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Created By
            </label>
            <div className="px-4 py-2 bg-muted rounded-md text-muted-foreground">
              {createdById ? createdByName : 'System (Initial Setup)'}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Admin'}
          </button>
        </div>
      </form>
    </div>
  );
}
