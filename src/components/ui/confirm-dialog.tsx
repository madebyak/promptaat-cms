'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
              case 'destructive':
          return {
            icon: <Trash2 className="h-4 w-4 text-red-600" />,
            iconBg: 'bg-red-100',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
          };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
              default:
          return {
            icon: <AlertTriangle className="h-4 w-4 text-blue-600" />,
            iconBg: 'bg-blue-100',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
          };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-[400pxn]">
      <DialogContent className="p-3">
        <div className="flex items-start gap-2">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-tight">
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-2 py-1 text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-2 py-1 text-xs ${styles.confirmButton}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="text-xs">Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Specialized delete confirmation dialog
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isLoading?: boolean;
  warningMessage?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading = false,
  warningMessage
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      description={
        warningMessage 
          ? `${warningMessage}\n\nThis action cannot be undone.`
          : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}
