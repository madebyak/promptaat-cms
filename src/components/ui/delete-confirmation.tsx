'use client'

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  itemName: string;
  itemType?: string;
  warningMessage?: string;
  isLoading?: boolean;
  destructiveAction?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = 'item',
  warningMessage,
  isLoading = false,
  destructiveAction = true
}: DeleteConfirmationProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${destructiveAction ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                {destructiveAction ? (
                  <Trash2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <DialogTitle>
                {title || `Delete ${itemType}`}
              </DialogTitle>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-foreground">
            {description || `Are you sure you want to delete ${itemType.toLowerCase()} `}
            {itemName && <span className="font-semibold">&quot;{itemName}&quot;</span>}?
            This action cannot be undone.
          </p>
          
          {warningMessage && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p>{warningMessage}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto ${destructiveAction ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
            >
              {isLoading ? 'Deleting...' : destructiveAction ? 'Delete' : 'Confirm'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
