import { useCallback } from 'react';
import { showToast } from '@/components/ui/sonner';

/**
 * Custom hook for using the global notification system
 * 
 * Usage:
 * const { success, error, warning, info, loading, promise, dismiss } = useNotification();
 * 
 * success({ title: 'User created', description: 'The user has been created successfully' });
 * error({ title: 'Error', description: 'Something went wrong', persistent: true });
 * warning({ title: 'Warning', description: 'This action cannot be undone', showProgress: true });
 * info({ title: 'Info', description: 'New features are available' });
 * 
 * // For async operations
 * promise(saveUser(), {
 *   loading: 'Saving user...',
 *   success: 'User saved successfully',
 *   error: 'Failed to save user'
 * });
 */
export function useNotification() {
  const success = useCallback((options: {
    title: string;
    description?: string;
    duration?: number;
    showProgress?: boolean;
    action?: { label: string; onClick: () => void };
  }) => {
    return showToast.success({
      title: options.title,
      description: options.description,
      duration: options.duration,
      showProgress: options.showProgress ?? true,
      action: options.action,
    });
  }, []);

  const error = useCallback((options: {
    title: string;
    description?: string;
    duration?: number;
    persistent?: boolean;
    showProgress?: boolean;
    action?: { label: string; onClick: () => void };
  }) => {
    return showToast.error({
      title: options.title,
      description: options.description,
      duration: options.duration,
      persistent: options.persistent,
      showProgress: options.showProgress ?? true,
      action: options.action,
    });
  }, []);

  const warning = useCallback((options: {
    title: string;
    description?: string;
    duration?: number;
    persistent?: boolean;
    showProgress?: boolean;
    action?: { label: string; onClick: () => void };
  }) => {
    return showToast.warning({
      title: options.title,
      description: options.description,
      duration: options.duration,
      persistent: options.persistent,
      showProgress: options.showProgress ?? true,
      action: options.action,
    });
  }, []);

  const info = useCallback((options: {
    title: string;
    description?: string;
    duration?: number;
    showProgress?: boolean;
    action?: { label: string; onClick: () => void };
  }) => {
    return showToast.info({
      title: options.title,
      description: options.description,
      duration: options.duration,
      showProgress: options.showProgress ?? true,
      action: options.action,
    });
  }, []);

  const loading = useCallback((title: string, description?: string) => {
    return showToast.loading(title, description);
  }, []);

  const promise = useCallback(<T,>(
    promiseFn: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return showToast.promise(promiseFn, options);
  }, []);

  const dismiss = useCallback((toastId?: string | number) => {
    showToast.dismiss(toastId);
  }, []);

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
  };
}

// Quick toast functions for common actions
export const notify = {
  // Generic success/error/warning/info
  success: (message: string, description?: string) => showToast.success({
    title: message,
    description,
    showProgress: true,
  }),

  error: (message: string, description?: string) => showToast.error({
    title: message,
    description,
    showProgress: true,
  }),

  warning: (message: string, description?: string) => showToast.warning({
    title: message,
    description,
    showProgress: true,
  }),

  info: (message: string, description?: string) => showToast.info({
    title: message,
    description,
    showProgress: true,
  }),

  // Specific action shortcuts
  copied: () => showToast.success({
    title: 'Copied to clipboard',
    description: 'The content has been copied successfully',
    duration: 2000,
    showProgress: false,
  }),

  saved: (itemName?: string) => showToast.success({
    title: 'Changes saved',
    description: itemName ? `${itemName} has been updated successfully` : 'Your changes have been saved',
    showProgress: true,
  }),

  created: (itemName: string) => showToast.success({
    title: `${itemName} created`,
    description: `The ${itemName.toLowerCase()} has been created successfully`,
    showProgress: true,
  }),

  deleted: (itemName: string) => showToast.success({
    title: itemName,
    description: 'Successfully removed',
    showProgress: true,
  }),

  uploaded: (fileName?: string) => showToast.success({
    title: 'Upload complete',
    description: fileName ? `${fileName} has been uploaded successfully` : 'File uploaded successfully',
    showProgress: true,
  }),

  published: (itemName?: string) => showToast.success({
    title: 'Published successfully',
    description: itemName ? `${itemName} is now live` : 'Changes are now live',
    showProgress: true,
  }),

  connected: (serviceName: string) => showToast.success({
    title: 'Connected',
    description: `Successfully connected to ${serviceName}`,
    showProgress: true,
  }),

  disconnected: (serviceName: string) => showToast.info({
    title: 'Disconnected',
    description: `${serviceName} has been disconnected`,
    showProgress: true,
  }),

  networkError: () => showToast.error({
    title: 'Network error',
    description: 'Please check your internet connection and try again',
    persistent: false,
    showProgress: true,
  }),

  serverError: () => showToast.error({
    title: 'Server error',
    description: 'Something went wrong. Please try again later',
    persistent: false,
    showProgress: true,
  }),

  unauthorized: () => showToast.error({
    title: 'Unauthorized',
    description: 'You do not have permission to perform this action',
    persistent: false,
    showProgress: true,
  }),

  validationError: (message?: string) => showToast.error({
    title: 'Validation error',
    description: message || 'Please check your input and try again',
    showProgress: true,
  }),
};
