'use client'

import { Button } from '@/components/ui/button';
import { Plus, Upload, Users, Settings, FileText, FolderPlus } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/posts">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">New Post</span>
          </Button>
        </Link>
        
        <Link href="/media">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <Upload className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Upload Media</span>
          </Button>
        </Link>
        
        <Link href="/users">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <Users className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </Button>
        </Link>
        
        <Link href="/categories">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <FolderPlus className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium">Add Category</span>
          </Button>
        </Link>
        
        <Link href="/analytics">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <FileText className="h-6 w-6 text-indigo-600" />
            <span className="text-sm font-medium">View Analytics</span>
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button 
            variant="outline" 
            className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
          >
            <Settings className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}