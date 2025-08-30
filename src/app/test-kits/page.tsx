'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestKitsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testDatabase = async () => {
    setLoading(true);
    setResult('Testing database connection...\n');
    
    try {
      // Test basic table access
      const response = await fetch('/api/admin/test-connection', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(prev => prev + `Connection test: ${JSON.stringify(data, null, 2)}\n\n`);
    } catch (error) {
      setResult(prev => prev + `Connection error: ${error}\n\n`);
    }
    
    setLoading(false);
  };

  const seedPromptKits = async () => {
    setLoading(true);
    setResult('Seeding prompt kits...\n');
    
    try {
      const response = await fetch('/api/admin/seed-prompt-kits', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(prev => prev + `Seed result: ${JSON.stringify(data, null, 2)}\n\n`);
    } catch (error) {
      setResult(prev => prev + `Seed error: ${error}\n\n`);
    }
    
    setLoading(false);
  };

  const testPromptKitsAPI = async () => {
    setLoading(true);
    setResult('Testing prompt kits API...\n');
    
    try {
      const { getPromptKits } = await import('@/lib/data/promptKits');
      const kits = await getPromptKits();
      setResult(prev => prev + `API result: Found ${kits.length} kits\n`);
      setResult(prev => prev + `First kit: ${JSON.stringify(kits[0], null, 2)}\n\n`);
    } catch (error) {
      setResult(prev => prev + `API error: ${error}\n\n`);
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Prompt Kits</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={testDatabase} disabled={loading}>
          Test Database Connection
        </Button>
        
        <Button onClick={seedPromptKits} disabled={loading}>
          Seed Prompt Kits
        </Button>
        
        <Button onClick={testPromptKitsAPI} disabled={loading}>
          Test Prompt Kits API
        </Button>
      </div>
      
      {loading && <div>Loading...</div>}
      
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
        {result || 'Click a button to run a test...'}
      </pre>
    </div>
  );
}
