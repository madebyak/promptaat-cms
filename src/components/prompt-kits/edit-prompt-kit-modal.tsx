'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag, ImagePlus, Eye, Edit } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SelectOption } from '@/components/ui/searchable-select';
import { MultiSelect } from '@/components/ui/multi-select';
import { uploadMedia } from '@/lib/data/media';
import { updatePromptKit } from '@/lib/data/promptKits';
import { LegacyCategory } from '@/types/category';
import { Tool } from '@/types/tool';
import { PromptKit } from '@/types/promptKit';
import { Editor } from 'primereact/editor';

interface EditPromptKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (promptKit: PromptKit) => void;
  categories: LegacyCategory[];
  tools: Tool[];
  promptKit: PromptKit | null;
}

interface FormData {
  name: string;
  description: string;
  instructions: string;
  article: string;
  image_url: string;
  tags: string[];
  visibility: 'published' | 'draft';
  tier: 'free' | 'pro';
  category_ids: (string | number)[];
  subcategory_ids: (string | number)[];
  tool_ids: (string | number)[];
}

interface FormErrors {
  name?: string;
  description?: string;
  instructions?: string;
  article?: string;
  image_url?: string;
  tags?: string;
  category_ids?: string;
  tool_ids?: string;
}

// Removed unused functions and components

export function EditPromptKitModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categories, 
  tools, 
  promptKit 
}: EditPromptKitModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    instructions: '',
    article: '',
    image_url: '',
    tags: [],
    visibility: 'published',
    tier: 'free',
    category_ids: [],
    subcategory_ids: [],
    tool_ids: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showArticlePreview, setShowArticlePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor>(null);
  const articleImageInputRef = useRef<HTMLInputElement>(null);

  // Reset and populate form when modal opens or promptKit changes
  useEffect(() => {
    if (isOpen && promptKit) {
      // Find category and subcategory IDs based on names
      const categoryIds: string[] = [];
      const subcategoryIds: string[] = [];

      if (promptKit.categories.length > 0) {
        promptKit.categories.forEach(categoryName => {
          const category = categories.find(c => c.name === categoryName);
          if (category) {
            categoryIds.push(category.id);
          }
        });
      }

      if (promptKit.subcategories.length > 0) {
        promptKit.subcategories.forEach(subcategoryName => {
          for (const category of categories) {
            if (category.children) {
              const subcategory = category.children.find(s => s.name === subcategoryName);
              if (subcategory) {
                subcategoryIds.push(subcategory.id);
                break;
              }
            }
          }
        });
      }

      // Get tool IDs from the prompt kit
      const toolIds = promptKit.tool_ids || [];

      setFormData({
        name: promptKit.name,
        description: promptKit.description,
        instructions: promptKit.instructions,
        article: promptKit.article,
        image_url: promptKit.image_url,
        tags: promptKit.tags,
        visibility: promptKit.visibility,
        tier: promptKit.tier,
        category_ids: categoryIds,
        subcategory_ids: subcategoryIds,
        tool_ids: toolIds
      });

      if (promptKit.image_url) {
        setImagePreview(promptKit.image_url);
      } else {
        setImagePreview(null);
      }
      
      setSelectedImageFile(null);
      setErrors({});
      setIsSubmitting(false);
      setNewTag('');
      setShowArticlePreview(false);
    }
  }, [isOpen, promptKit, categories]);

  // Handle Quill editor setup and image handler
  useEffect(() => {
    if (isOpen && !showArticlePreview) {
      // Add a small delay to ensure the editor is fully loaded
      const timer = setTimeout(() => {
        if (editorRef.current) {
          try {
            // Get the Quill instance
            const quillInstance = editorRef.current.getQuill();
            
            if (quillInstance) {
              // Override the default image handler
              const toolbar = quillInstance.getModule('toolbar');
              toolbar.addHandler('image', () => {
                console.log('🖼️ Image button clicked - triggering file input');
                handleImageInsert();
              });
              
              console.log('✅ Custom image handler registered');
            } else {
              console.log('⚠️ Quill instance not found');
            }
          } catch (error) {
            console.error('❌ Error setting up image handler:', error);
          }
        } else {
          console.log('⚠️ Editor ref not found');
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, showArticlePreview]);

  // Create category and subcategory options for the dropdowns
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
  
  // Get subcategories for the selected categories
  const subcategoryOptions: SelectOption[] = React.useMemo(() => {
    if (formData.category_ids.length === 0) return [];
    
    const allSubcategories: SelectOption[] = [];
    formData.category_ids.forEach(categoryId => {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      if (selectedCategory && selectedCategory.children) {
        selectedCategory.children.forEach(subcat => {
          // Avoid duplicates
          if (!allSubcategories.find(sub => sub.value === subcat.id)) {
            allSubcategories.push({
              value: subcat.id,
              label: subcat.name
            });
          }
        });
      }
    });
    
    return allSubcategories;
  }, [categories, formData.category_ids]);

  // Create tool options for the multi-select
  const toolOptions: SelectOption[] = React.useMemo(() => {
    return tools.map(tool => ({
      value: tool.id,
      label: tool.name
    }));
  }, [tools]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      // Split by comma and process each tag
      const tags = newTag.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const newTags = tags.filter(tag => !formData.tags.includes(tag));
      
      if (newTags.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, ...newTags]
        }));
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          image_url: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Store the file for later upload and create preview
      setSelectedImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Clear any previous errors
        setErrors(prev => ({ ...prev, image_url: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertPrompt = () => {
    // For rich text editor, we'll insert a styled prompt placeholder
    const promptHtml = '<div class="prompt-placeholder" style="border: 2px solid #3b82f6; border-radius: 8px; padding: 12px; margin: 8px 0; background-color: #eff6ff; color: #1e40af;"><strong>Prompt:</strong> Click here to edit this prompt</div>';
    
    // Update the form data by appending the prompt HTML
    setFormData(prev => ({ 
      ...prev, 
      article: prev.article + promptHtml 
    }));
  };

  const handleArticleImageUpload = async (file: File) => {
    try {
      console.log('🚀 Uploading article image...');
      const uploadedMedia = await uploadMedia(file, {
        alt: `Article image for ${formData.name || 'prompt kit'}`
      }, 'article-images');
      
      console.log('✅ Article image uploaded successfully:', uploadedMedia.url);
      return uploadedMedia.url;
    } catch (error) {
      console.error('❌ Failed to upload article image:', error);
      throw error;
    }
  };

  const handleImageInsert = () => {
    console.log('📁 Opening file dialog for article image...');
    if (articleImageInputRef.current) {
      articleImageInputRef.current.click();
      console.log('✅ File dialog triggered');
    } else {
      console.error('❌ Article image input ref not found');
    }
  };

  const handleArticleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    // Show loading state
    console.log('🖼️ Starting article image upload...', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    try {
      const imageUrl = await handleArticleImageUpload(file);
      console.log('✅ Article image upload completed, URL:', imageUrl);
      
      // Insert image into Quill editor using the Quill API
      if (editorRef.current) {
        const quillInstance = editorRef.current.getQuill();
        if (quillInstance) {
          // Get current cursor position
          const range = quillInstance.getSelection(true);
          const index = range ? range.index : quillInstance.getLength();
          
          // Insert the image at cursor position
          quillInstance.insertEmbed(index, 'image', imageUrl);
          
          // Move cursor after the image
          quillInstance.setSelection(index + 1);
          
          console.log('✅ Image inserted into Quill editor at position:', index);
          
          // Update form data with the new content
          const newContent = quillInstance.root.innerHTML;
          setFormData(prev => ({ 
            ...prev, 
            article: newContent 
          }));
          
          console.log('✅ Form data updated with new content');
        } else {
          console.error('❌ Quill instance not found');
        }
      } else {
        console.error('❌ Editor ref not found');
      }
      
    } catch (error) {
      console.error('❌ Article image upload failed:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Clear the input
    if (articleImageInputRef.current) {
      articleImageInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Kit name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Kit name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    // Article validation
    if (!formData.article.trim()) {
      newErrors.article = 'Article content is required';
    }

    // Tags validation
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
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
    
    if (!validateForm() || !promptKit) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;
      
      // Upload new image if one was selected
      if (selectedImageFile) {
        console.log('🚀 Edit Prompt Kit: Uploading new image on save...');
        const uploadedMedia = await uploadMedia(selectedImageFile, {
          alt: `Prompt kit image for ${formData.name.trim()}`
        }, 'prompt-kit-images');
        
        imageUrl = uploadedMedia.url;
        console.log('✅ Edit Prompt Kit: Image uploaded successfully:', imageUrl);
      }

      // Prepare data for API - convert IDs back to names
      const selectedCategories = categories.filter(cat => formData.category_ids.includes(cat.id));
      const selectedSubcategories = formData.subcategory_ids.map(subId => {
        for (const category of categories) {
          if (category.children) {
            const subcategory = category.children.find(sub => sub.id === subId);
            if (subcategory) return subcategory;
          }
        }
        return null;
      }).filter(Boolean);
      
      // Map to the format expected by the API
      const updatedPromptKit = {
        id: promptKit.id,
        name: formData.name,
        description: formData.description,
        instructions: formData.instructions,
        article: formData.article,
        image_url: imageUrl,
        tags: formData.tags,
        visibility: isDraft ? 'draft' : formData.visibility,
        tier: formData.tier,
        categories: selectedCategories.map(cat => cat.name),
        subcategories: selectedSubcategories.map(sub => sub!.name),
        tool_ids: formData.tool_ids.map(id => String(id))
      };

      // Call the real API to update the prompt kit
      const result = await updatePromptKit(promptKit.id, updatedPromptKit);
      
      if (result) {
        onSuccess(result);
        onClose();
      } else {
        throw new Error('Failed to update prompt kit');
      }
    } catch (error) {
      console.error('Failed to update prompt kit:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const handleInputChange = (field: keyof FormData, value: string | (string | number)[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!promptKit) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Edit Prompt Kit</DialogTitle>
              <DialogDescription>
                Update the details of your prompt kit.
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-6 py-4 space-y-8 max-h-[70vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            {/* Kit Name */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Kit Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter kit name..."
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
                placeholder="Enter kit description..."
                error={errors.description}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>



            {/* Article Content */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Article Content <span className="text-destructive">*</span>
              </label>
              
              {/* Article Toolbar */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  onClick={insertPrompt}
                  disabled={isSubmitting}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Prompt
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowArticlePreview(!showArticlePreview)}
                  variant="outline"
                  size="sm"
                >
                  {showArticlePreview ? (
                    <>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>

              {showArticlePreview ? (
                <div className="border rounded-lg p-4 bg-muted/30 min-h-64 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: formData.article }} />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  {/* Hidden file input for article images */}
                  <input
                    ref={articleImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArticleImageChange}
                    className="hidden"
                  />
                  <Editor
                    ref={editorRef}
                    value={formData.article}
                    onTextChange={(e) => handleInputChange('article', e.htmlValue || '')}
                    style={{ height: '320px' }}
                    placeholder="Write your article content..."
                    headerTemplate={
                      <span className="ql-formats">
                        <select className="ql-header" defaultValue="false">
                          <option value="1">Heading</option>
                          <option value="2">Subheading</option>
                          <option value="false">Normal</option>
                        </select>
                        <button className="ql-bold" aria-label="Bold"></button>
                        <button className="ql-italic" aria-label="Italic"></button>
                        <button className="ql-underline" aria-label="Underline"></button>
                        <button className="ql-strike" aria-label="Strike"></button>
                        <select className="ql-color" aria-label="Text Color" defaultValue="">
                          <option value="red"></option>
                          <option value="green"></option>
                          <option value="blue"></option>
                          <option value="orange"></option>
                          <option value="violet"></option>
                          <option value="#d0d1d2"></option>
                          <option value=""></option>
                        </select>
                        <select className="ql-background" aria-label="Background Color" defaultValue="">
                          <option value="red"></option>
                          <option value="green"></option>
                          <option value="blue"></option>
                          <option value="orange"></option>
                          <option value="violet"></option>
                          <option value="#d0d1d2"></option>
                          <option value=""></option>
                        </select>
                        <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
                        <button className="ql-list" value="bullet" aria-label="Unordered List"></button>
                        <button className="ql-blockquote" aria-label="Blockquote"></button>
                        <button className="ql-link" aria-label="Link"></button>
                        <button className="ql-image" aria-label="Insert Image"></button>
                        <button className="ql-code-block" aria-label="Code Block"></button>
                        <button className="ql-clean" aria-label="Remove Styles"></button>
                      </span>
                    }
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Use the &quot;Add Prompt&quot; button to insert prompt placeholders that can be styled differently.
              </p>
              
              {errors.article && (
                <p className="text-sm text-destructive">{errors.article}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Kit Thumbnail
              </label>
              <div className="flex flex-col items-center justify-center w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                {imagePreview ? (
                  <div className="relative w-full max-w-2xl h-[300px] mb-4 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Kit thumbnail"
                      className="w-full h-full object-contain rounded-lg border-2 border-dashed border-border bg-muted/30"
                      width={400}
                      height={300}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/90 hover:bg-background border border-border shadow-sm transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full max-w-2xl h-[300px] mx-auto flex flex-col items-center justify-center gap-4 
                             border-2 border-dashed rounded-lg hover:bg-muted/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <div className="p-4 rounded-full bg-muted/50">
                      <ImagePlus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-base font-medium text-foreground">
                        Click to upload thumbnail
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SVG, PNG, JPG (max. 5MB)
                      </p>
                    </div>
                  </Button>
                )}
                {errors.image_url && (
                  <p className="text-sm text-destructive mt-2">{errors.image_url}</p>
                )}
              </div>
            </div>

            {/* Tags/Keywords */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tags/Keywords <span className="text-destructive">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tags (comma-separated) and press Enter..."
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || isSubmitting}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md"
                      >
                        <Tag className="h-3 w-3" />
                        <span className="text-sm">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.tags && (
                  <p className="text-sm text-destructive">{errors.tags}</p>
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
                  options={subcategoryOptions}
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
                {isSubmitting ? 'Updating...' : 'Update Kit'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
