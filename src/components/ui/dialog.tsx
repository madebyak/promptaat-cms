'use client'

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, children, className = '', maxWidth }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${className}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200" />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`relative bg-background border border-border rounded-lg shadow-lg 
                   ${maxWidth || 'max-w-2xl'} w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden
                   animate-in fade-in-0 zoom-in-95 duration-200
                   ${maxWidth ? '' : 'sm:max-w-lg md:max-w-xl lg:max-w-2xl'}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`flex items-center justify-end p-4 sm:p-6 border-t border-border bg-muted/20 ${className}`}>
      {children}
    </div>
  );
}

interface DialogCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export function DialogCloseButton({ onClose, className = '' }: DialogCloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className={`p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ${className}`}
      aria-label="Close dialog"
    >
      <X className="h-4 w-4" />
    </button>
  );
}