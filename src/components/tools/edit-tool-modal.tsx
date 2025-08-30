'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Tool } from '@/types/tool';
import { updateTool } from '@/lib/data/tools';
import { uploadMedia } from '@/lib/data/media';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface EditToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tool: Tool) => void;
  toolToEdit: Tool | null;
}

interface FormData {
  name: string;
  image_url: string;
  website_link: string;
  sort_order: number;
}

interface FormErrors {
  name?: string;
  image_url?: string;
  website_link?: string;
  sort_order?: string;
}

export function EditToolModal({ isOpen, onClose, onSuccess, toolToEdit }: EditToolModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    image_url: '',
    website_link: '',
    sort_order: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or toolToEdit changes
  useEffect(() => {
    if (isOpen && toolToEdit) {
      setFormData({
        name: toolToEdit.name,
        image_url: toolToEdit.image_url || '',
        website_link: toolToEdit.website_link || '',
        sort_order: toolToEdit.sort_order
      });
      setImagePreview(toolToEdit.image_url || null);
      setSelectedImageFile(null);
      setErrors({});
      setIsSubmitting(false);
    } else if (!isOpen) {
      setFormData({
        name: '',
        image_url: '',
        website_link: '',
        sort_order: 1
      });
      setErrors({});
      setIsSubmitting(false);
      setImagePreview(null);
      setSelectedImageFile(null);
    }
  }, [isOpen, toolToEdit]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tool name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tool name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Tool name must be less than 100 characters';
    }

    // Website link validation
    if (formData.website_link && !isValidUrl(formData.website_link)) {
      newErrors.website_link = 'Please enter a valid URL';
    }

    // Sort order validation
    if (formData.sort_order < 1) {
      newErrors.sort_order = 'Sort order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !toolToEdit) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;
      
      // Upload new image if one was selected
      if (selectedImageFile) {
        console.log('🚀 Edit Tool: Uploading new image on save...');
        const uploadedMedia = await uploadMedia(selectedImageFile, {
          alt: `Tool image for ${formData.name.trim()}`
        }, 'tool-images');
        
        imageUrl = uploadedMedia.url;
        console.log('✅ Edit Tool: Image uploaded successfully:', imageUrl);
      }

      // Update tool in database
      const updatedTool = await updateTool(toolToEdit.id, {
        name: formData.name.trim(),
        image_url: imageUrl || undefined,
        website_link: formData.website_link.trim() || undefined,
        sort_order: formData.sort_order
      });

      if (updatedTool) {
        onSuccess(updatedTool);
        onClose();
      } else {
        throw new Error('Failed to update tool');
      }
    } catch (error) {
      console.error('Failed to update tool:', error);
      // Handle error (could show toast notification)
      alert('Failed to update tool. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Edit Tool</DialogTitle>
              <DialogDescription>
                Update the tool information. Changes will be saved to your collection.
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-4 sm:px-6 py-4 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            {/* Tool Name */}
            <div className="space-y-3">
              <label htmlFor="toolName" className="block text-sm font-medium text-foreground mb-1.5">
                Tool Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="toolName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter tool name..."
                error={!!errors.name}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tool Image
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
                  <div className="relative w-full max-w-2xl h-[200px] sm:h-[300px] mb-4 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Tool preview"
                      className="w-full h-full object-contain rounded-lg border-2 border-dashed border-border bg-muted/30"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full bg-background/90 hover:bg-background border border-border shadow-sm transition-colors touch-manipulation"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full max-w-2xl h-[200px] sm:h-[300px] mx-auto flex flex-col items-center justify-center gap-3 sm:gap-4 
                             border-2 border-dashed rounded-lg hover:bg-muted/30 transition-colors touch-manipulation"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <div className="p-3 sm:p-4 rounded-full bg-muted/50">
                      <ImagePlus className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 text-center">
                      <p className="text-sm sm:text-base font-medium text-foreground">
                        Click to upload image
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
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

            {/* Website Link */}
            <div className="space-y-3">
              <label htmlFor="websiteLink" className="block text-sm font-medium text-foreground mb-1.5">
                Website Link
              </label>
              <Input
                id="websiteLink"
                type="url"
                value={formData.website_link}
                onChange={(e) => handleInputChange('website_link', e.target.value)}
                placeholder="Enter website URL..."
                error={!!errors.website_link}
                disabled={isSubmitting}
              />
              {errors.website_link && (
                <p className="text-sm text-destructive">{errors.website_link}</p>
              )}
            </div>

            {/* Sort Order */}
            <div className="space-y-3">
              <label htmlFor="sortOrder" className="block text-sm font-medium text-foreground mb-1.5">
                Sort Order
              </label>
              <Input
                id="sortOrder"
                type="number"
                min={1}
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 1)}
                error={!!errors.sort_order}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Determines the display order. Lower numbers appear first.
              </p>
              {errors.sort_order && (
                <p className="text-sm text-destructive">{errors.sort_order}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
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
                type="submit"
                disabled={isSubmitting}
                className="text-white w-full sm:w-auto"
                style={{backgroundColor: '#A2AADB'}}
              >
                {isSubmitting ? 'Updating...' : 'Update Tool'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
