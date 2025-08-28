'use client'

import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { MultiSelect } from '@/components/ui/multi-select';
import { LegacyCategory } from '@/types/category';
import { Tool } from '@/types/tool';
import { CreatePromptData, Prompt } from '@/types/prompt';
import { createPrompt } from '@/lib/data/prompts';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (prompt: Prompt) => void;
  categories: LegacyCategory[];
  tools: Tool[];
}

interface FormData {
  name: string;
  description: string;
  prompt_content: string;
  instructions: string;
  keywords: string[];
  visibility: 'published' | 'draft';
  tier: 'free' | 'pro';
  category_ids: (string | number)[];
  subcategory_ids: (string | number)[];
  tool_ids: (string | number)[];
}

interface FormErrors {
  name?: string;
  description?: string;
  prompt_content?: string;
  instructions?: string;
  keywords?: string;
  category_ids?: string;
  tool_ids?: string;
}

export function AddPromptModal({ isOpen, onClose, onSuccess, categories, tools }: AddPromptModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    prompt_content: '',
    instructions: '',
    keywords: [],
    visibility: 'published',
    tier: 'free',
    category_ids: [],
    subcategory_ids: [],
    tool_ids: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegacyCategory | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        prompt_content: '',
        instructions: '',
        keywords: [],
        visibility: 'published',
        tier: 'free',
        category_ids: [],
        subcategory_ids: [],
        tool_ids: []
      });
      setErrors({});
      setIsSubmitting(false);
      setNewKeyword('');
      setSelectedCategory(null);
    }
  }, [isOpen]);

  // Create category options for the dropdown
  const categoryOptions: SelectOption[] = React.useMemo(() => {
    const options: SelectOption[] = [];

    categories.forEach(category => {
      // Add main category
      options.push({
        value: category.id,
        label: category.name
      });
    });
    
    return options;
  }, [categories]);

  // Create tool options for the multi-select
  const toolOptions: SelectOption[] = React.useMemo(() => {
    return tools.map(tool => ({
      value: tool.id,
      label: tool.name
    }));
  }, [tools]);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      // Split by comma and process each keyword
      const keywords = newKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const newKeywords = keywords.filter(keyword => !formData.keywords.includes(keyword));
      
      if (newKeywords.length > 0) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, ...newKeywords]
        }));
      }
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Prompt name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Prompt name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Prompt content validation
    if (!formData.prompt_content.trim()) {
      newErrors.prompt_content = 'Prompt content is required';
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    // Keywords validation
    if (formData.keywords.length === 0) {
      newErrors.keywords = 'At least one keyword is required';
    }

    // Category validation
    if (formData.category_ids.length === 0) {
      newErrors.category_ids = 'Please select at least one category';
    }

    // Tools validation
    if (formData.tool_ids.length === 0) {
      newErrors.tool_ids = 'Please select at least one tool';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const promptData: CreatePromptData = {
        name: formData.name,
        description: formData.description,
        prompt_content: formData.prompt_content,
        instructions: formData.instructions,
        keywords: formData.keywords,
        visibility: isDraft ? 'draft' : 'published',
        tier: formData.tier,
        category_ids: formData.category_ids.map(id => String(id)),
        subcategory_ids: formData.subcategory_ids.map(id => String(id)),
        tool_ids: formData.tool_ids.map(id => String(id))
      };

      const newPrompt = await createPrompt(promptData);
      onSuccess(newPrompt);
      onClose();
    } catch (error) {
      console.error('Failed to create prompt:', error);
      alert('Failed to create prompt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const handleInputChange = (field: keyof FormData, value: string | (string | number)[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Add New Prompt</DialogTitle>
              <DialogDescription>
                Create a new prompt and assign it to categories and tools.
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-6 py-4 space-y-8 max-h-[70vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            {/* Prompt Name */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Prompt Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter prompt name..."
                error={!!errors.name}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter prompt description..."
                error={errors.description}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Prompt Content */}
            <div className="space-y-3">
              <label htmlFor="promptContent" className="block text-sm font-medium text-foreground mb-1.5">
                Prompt Content <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="promptContent"
                value={formData.prompt_content}
                onChange={(e) => handleInputChange('prompt_content', e.target.value)}
                placeholder="Enter the actual prompt content..."
                error={errors.prompt_content}
                disabled={isSubmitting}
                rows={5}
              />
              {errors.prompt_content && (
                <p className="text-sm text-destructive">{errors.prompt_content}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <label htmlFor="instructions" className="block text-sm font-medium text-foreground mb-1.5">
                Instructions <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter instructions on how to use the prompt..."
                error={errors.instructions}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.instructions && (
                <p className="text-sm text-destructive">{errors.instructions}</p>
              )}
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Keywords <span className="text-destructive">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type keywords (comma-separated) and press Enter..."
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim() || isSubmitting}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md"
                      >
                        <Tag className="h-3 w-3" />
                        <span className="text-sm">{keyword}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.keywords && (
                  <p className="text-sm text-destructive">{errors.keywords}</p>
                )}
              </div>
            </div>

            {/* Category and Subcategory Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Categories */}
              <div className="space-y-3">
                <label htmlFor="categories" className="block text-sm font-medium text-foreground mb-1.5">
                  Categories <span className="text-destructive">*</span>
                </label>
                <MultiSelect
                  options={categoryOptions}
                  values={formData.category_ids}
                  onValuesChange={(values) => {
                    handleInputChange('category_ids', values);
                    // Remove subcategories that are no longer valid
                    const validSubcategoryIds = formData.subcategory_ids.filter(subId => {
                      return values.some(categoryId => {
                        const category = categories.find(cat => cat.id === categoryId);
                        return category?.children?.some(sub => sub.id === subId);
                      });
                    });
                    if (validSubcategoryIds.length !== formData.subcategory_ids.length) {
                      handleInputChange('subcategory_ids', validSubcategoryIds);
                    }
                  }}
                  placeholder="Select categories..."
                  searchPlaceholder="Search categories..."
                  className="w-full"
                />
                {errors.category_ids && (
                  <p className="text-sm text-destructive">{errors.category_ids}</p>
                )}
              </div>
              
              {/* Subcategories */}
              <div className="space-y-3">
                <label htmlFor="subcategories" className="block text-sm font-medium text-foreground mb-1.5">
                  Subcategories
                </label>
                <MultiSelect
                  options={formData.category_ids.length > 0 ? 
                    categories
                      .filter(cat => formData.category_ids.includes(cat.id))
                      .flatMap(cat => cat.children || [])
                      .filter((sub, index, arr) => arr.findIndex(s => s.id === sub.id) === index) // Remove duplicates
                      .map(sub => ({
                        value: sub.id,
                        label: sub.name
                      }))
                    : []
                  }
                  values={formData.subcategory_ids}
                  onValuesChange={(values) => handleInputChange('subcategory_ids', values)}
                  placeholder={formData.category_ids.length > 0 ? "Select subcategories..." : "Select categories first..."}
                  searchPlaceholder="Search subcategories..."
                  className="w-full"
                  disabled={formData.category_ids.length === 0}
                />
              </div>
            </div>

            {/* Tools Selection */}
            <div className="space-y-3">
              <label htmlFor="tools" className="block text-sm font-medium text-foreground mb-1.5">
                Tools <span className="text-destructive">*</span>
              </label>
              <MultiSelect
                options={toolOptions}
                values={formData.tool_ids}
                onValuesChange={(values) => handleInputChange('tool_ids', values)}
                placeholder="Select tools..."
                searchPlaceholder="Search tools..."
                className="w-full"
              />
              {errors.tool_ids && (
                <p className="text-sm text-destructive">{errors.tool_ids}</p>
              )}
            </div>

            {/* Tier */}
            <div className="space-y-3">
              <label htmlFor="tier" className="block text-sm font-medium text-foreground mb-1.5">
                Tier
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('tier', 'free')}
                  className={`flex-1 px-3 py-2 rounded-md border ${
                    formData.tier === 'free'
                      ? 'bg-accent text-accent-foreground border-ring'
                      : 'bg-background border-input hover:bg-accent/50'
                  } transition-colors`}
                  disabled={isSubmitting}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tier', 'pro')}
                  className={`flex-1 px-3 py-2 rounded-md border ${
                    formData.tier === 'pro'
                      ? 'bg-accent text-accent-foreground border-ring'
                      : 'bg-background border-input hover:bg-accent/50'
                  } transition-colors`}
                  disabled={isSubmitting}
                >
                  Pro
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-between">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white w-full sm:w-auto"
                style={{backgroundColor: '#A2AADB'}}
              >
                {isSubmitting ? 'Creating...' : 'Create Prompt'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


