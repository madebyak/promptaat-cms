'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Database, TestTube, Server, CheckCircle } from 'lucide-react';

interface AdminSetupProps {
  onDataChanged?: () => void;
}

export function AdminSetup({ onDataChanged }: AdminSetupProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [isCheckingEnv, setIsCheckingEnv] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        onDataChanged?.();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error initializing admin system:', error);
      alert('Failed to initialize admin system');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        onDataChanged?.();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error seeding admin data:', error);
      alert('Failed to seed admin data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/test-connection');
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Connection Test Failed: ${result.error}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('❌ Connection test failed: Network error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestServerCreation = async () => {
    setIsTestingServer(true);
    try {
      const testAdmin = {
        email: 'test.server@promptaat.com',
        first_name: 'Test',
        last_name: 'Server',
        role: 'moderator',
        created_by: null
      };

      const response = await fetch('/api/admin/create-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAdmin)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Server-side admin creation successful!\n\nCreated: ${result.admin.first_name} ${result.admin.last_name} (${result.admin.email})`);
        onDataChanged?.();
      } else {
        alert(`❌ Server-side creation failed: ${result.error}\n\nCode: ${result.code}\nDetails: ${JSON.stringify(result.details, null, 2)}`);
      }
    } catch (error) {
      console.error('Error testing server creation:', error);
      alert('❌ Server creation test failed: Network error');
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleCheckEnv = async () => {
    setIsCheckingEnv(true);
    try {
      const response = await fetch('/api/admin/check-env');
      const result = await response.json();
      
      if (response.ok) {
        const status = result.allPresent ? '✅' : '❌';
        alert(`${status} Environment Check:\n\n` +
              `Supabase URL: ${result.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'} (${result.env.url_value})\n` +
              `Anon Key: ${result.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'} (length: ${result.env.anon_key_length})\n` +
              `Service Key: ${result.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'} (length: ${result.env.service_key_length})\n\n` +
              `All Required Keys Present: ${result.allPresent ? 'YES' : 'NO'}`);
      } else {
        alert(`❌ Environment check failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error checking environment:', error);
      alert('❌ Environment check failed: Network error');
    } finally {
      setIsCheckingEnv(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Admin System Setup</h3>
      </div>
      
      <p className="text-muted-foreground mb-4">
        Use these tools to initialize the admin system or add sample data for testing.
      </p>
      
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handleCheckEnv}
          disabled={isCheckingEnv}
          variant="outline"
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {isCheckingEnv ? 'Checking...' : 'Check Environment'}
        </Button>
        
        <Button
          onClick={handleTestConnection}
          disabled={isTesting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {isTesting ? 'Testing...' : 'Test Database Connection'}
        </Button>
        
        <Button
          onClick={handleTestServerCreation}
          disabled={isTestingServer}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Server className="h-4 w-4" />
          {isTestingServer ? 'Testing...' : 'Test Server-side Creation'}
        </Button>
        
        <Button
          onClick={handleInitialize}
          disabled={isInitializing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          {isInitializing ? 'Initializing...' : 'Initialize Admin System'}
        </Button>
        
        <Button
          onClick={handleSeed}
          disabled={isSeeding}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSeeding ? 'Adding Sample Data...' : 'Add Sample Data'}
        </Button>
      </div>
    </div>
  );
}
