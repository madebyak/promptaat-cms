'use client'

import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { usePromptKits } from '@/hooks/usePromptKits';
import { Button } from '@/components/ui/button';
import { createPromptKit, getPromptKitById } from '@/lib/data/promptKits';
import { LegacyCategory } from '@/types/category';
import { PromptKit } from '@/types/promptKit';

export default function TestPromptKitsCategories() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  const { promptKits, loading: promptKitsLoading } = usePromptKits();

  const logResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runTests = async () => {
    if (categoriesLoading || promptKitsLoading) {
      logResult('❌ Cannot run tests while data is loading');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);
    logResult('🧪 Starting tests...');

    try {
      // Test 1: Check if categories are loaded
      if (categories.length > 0) {
        logResult(`✅ Categories loaded: ${categories.length} categories found`);
      } else {
        logResult('❌ No categories found');
      }

      // Test 2: Check if prompt kits are loaded
      logResult(`ℹ️ Prompt kits loaded: ${promptKits.length} kits found`);

      // Test 3: Create a test prompt kit with category
      if (categories.length > 0) {
        const testCategory = categories[0];
        const testSubcategory = testCategory.children && testCategory.children.length > 0 
          ? testCategory.children[0] 
          : null;

        logResult(`ℹ️ Using category: ${testCategory.name}`);
        if (testSubcategory) {
          logResult(`ℹ️ Using subcategory: ${testSubcategory.name}`);
        }

        try {
          // Create a test prompt kit
          const newKit = await createTestPromptKit(testCategory, testSubcategory);
          logResult(`✅ Created test prompt kit with ID: ${newKit.id}`);

          // Verify the kit was created with the correct category
          const retrievedKit = await getPromptKitById(newKit.id);
          if (retrievedKit) {
            logResult('✅ Retrieved the created kit');
            
            // Check categories
            if (retrievedKit.categories.includes(testCategory.name)) {
              logResult('✅ Category correctly associated with the kit');
            } else {
              logResult(`❌ Category association failed. Expected ${testCategory.name}, got ${retrievedKit.categories.join(', ')}`);
            }

            // Check subcategories if applicable
            if (testSubcategory) {
              if (retrievedKit.subcategories.includes(testSubcategory.name)) {
                logResult('✅ Subcategory correctly associated with the kit');
              } else {
                logResult(`❌ Subcategory association failed. Expected ${testSubcategory.name}, got ${retrievedKit.subcategories.join(', ')}`);
              }
            }
          } else {
            logResult('❌ Failed to retrieve the created kit');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logResult(`❌ Error creating/retrieving test kit: ${errorMessage}`);
        }
      } else {
        logResult('⚠️ Skipping create test - no categories available');
      }

      logResult('🏁 Tests completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logResult(`❌ Test error: ${errorMessage}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Helper function to create a test prompt kit
  async function createTestPromptKit(
    category: LegacyCategory, 
    subcategory: LegacyCategory | null
  ): Promise<PromptKit> {
    const testKit = {
      name: `Test Kit ${new Date().toISOString().slice(0, 19)}`,
      description: 'A test prompt kit for integration testing',
      instructions: 'Test instructions',
      article: 'Test article content\n\n[[Test prompt]]',
      image_url: '',
      tags: ['test', 'integration'],
      visibility: 'draft' as const,
      tier: 'free' as const,
      categories: [category.name],
      subcategories: subcategory ? [subcategory.name] : [],
      tool_ids: [],
      // Add missing required fields
      rating: 0,
      likes_count: 0,
      views_count: 0,
      uses_count: 0
    };

    return await createPromptKit(testKit);
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Prompt Kits - Categories Integration Test</h1>
      
      <div className="mb-6">
        <Button 
          onClick={runTests}
          disabled={isRunningTests || categoriesLoading || promptKitsLoading}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          {isRunningTests ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {(categoriesLoading || promptKitsLoading) && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          Loading data... Please wait before running tests.
        </div>
      )}

      <div className="border rounded-lg p-4 bg-black text-green-400 font-mono">
        <h2 className="text-xl mb-4 text-white">Test Results:</h2>
        <pre className="whitespace-pre-wrap">
          {testResults.length > 0 
            ? testResults.map((result, i) => <div key={i}>{result}</div>)
            : 'No tests run yet'}
        </pre>
      </div>
    </div>
  );
}
