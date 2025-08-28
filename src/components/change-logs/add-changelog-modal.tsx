'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createChangeLog } from '@/lib/data/changeLogs';
import { uploadMedia } from '@/lib/data/media';
import { ChangeLog } from '@/types/changeLog';

interface AddChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (changelog: ChangeLog) => void;
}

interface FormData {
  name: string;
  image_url: string;
  description: string;
}

interface FormErrors {
  name?: string;
  image_url?: string;
  description?: string;
}

export function AddChangeLogModal({ isOpen, onClose, onSuccess }: AddChangeLogModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    image_url: '',
    description: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        image_url: '',
        description: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setImagePreview(null);
      setSelectedImageFile(null);
    }
  }, [isOpen]);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Change log name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Change log name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;
      
      // Upload image if one was selected
      if (selectedImageFile) {
        console.log('🚀 Changelog: Uploading image on save...');
        const uploadedMedia = await uploadMedia(selectedImageFile, {
          alt: `Changelog image for ${formData.name.trim()}`
        }, 'changelog-images');
        
        imageUrl = uploadedMedia.url;
        console.log('✅ Changelog: Image uploaded successfully:', imageUrl);
      }

      const newChangeLog = await createChangeLog({
        name: formData.name.trim(),
        image_url: imageUrl,
        description: formData.description.trim()
      });

      onSuccess(newChangeLog);
      onClose();
    } catch (error) {
      console.error('Failed to create change log:', error);
      setErrors({ name: 'Failed to create change log. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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
              <DialogTitle>Add New Change Log</DialogTitle>
              <DialogDescription>
                Document new features, improvements, and bug fixes.
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-6 py-4 space-y-8 max-h-[70vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            {/* Change Log Name */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Change Log Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter change log name..."
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
                Change Log Image
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
                    <img
                      src={imagePreview}
                      alt="Change log preview"
                      className="w-full h-full object-contain rounded-lg border-2 border-dashed border-border bg-muted/30"
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
                        Click to upload image
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

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the changes, improvements, or fixes..."
                error={errors.description}
                disabled={isSubmitting}
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
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
                {isSubmitting ? 'Creating...' : 'Create Change Log'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




