'use client'

import { useState } from 'react';
import { PromptRequest } from '@/types/promptRequest';
import { X, User, Calendar, Clock, Hash } from 'lucide-react';

interface ViewPromptRequestModalProps {
  request: PromptRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (requestId: string, status: PromptRequest['status']) => Promise<boolean>;
}

function StatusBadge({ status }: { status: PromptRequest['status'] }) {
  let bgColor, textColor;
  
  switch (status) {
    case 'in_review':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'approved':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  const displayText = status === 'in_review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

export function ViewPromptRequestModal({ request, isOpen, onClose, onUpdateStatus }: ViewPromptRequestModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !request) return null;

  const handleStatusUpdate = async (newStatus: PromptRequest['status']) => {
    if (!onUpdateStatus) return;
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(request.id, newStatus);
      // Modal will update automatically when parent component updates
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Prompt Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={request.status} />
          </div>

          {/* Request Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Title
              </label>
              <h3 className="text-lg font-semibold text-foreground">{request.title}</h3>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description
              </label>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">{request.description}</p>
              </div>
            </div>

            {/* User Info */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Requested by
              </label>
              <div className="flex items-center gap-3">
                {request.userAvatar ? (
                  <img
                    src={request.userAvatar}
                    alt={request.userName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{request.userName}</p>
                  <p className="text-sm text-muted-foreground">User ID: {request.userId}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Submitted
                </label>
                <p className="text-foreground">{formatDate(request.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Last Updated
                </label>
                <p className="text-foreground">{formatDate(request.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          {onUpdateStatus && (
            <div className="flex gap-2">
              {request.status !== 'approved' && (
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {request.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {request.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
