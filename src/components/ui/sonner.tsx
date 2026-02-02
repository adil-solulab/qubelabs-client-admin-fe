import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors={false}
      closeButton={false}
      duration={4000}
      gap={8}
      visibleToasts={5}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "data-[removed=true]:animate-out data-[removed=true]:slide-out-to-right-full data-[removed=true]:fade-out-0 data-[removed=true]:duration-200",
            "max-w-[380px]"
          ),
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground mt-1",
          actionButton: "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors",
          cancelButton: "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-muted/80 transition-colors",
          closeButton: cn(
            "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity",
            "hover:bg-muted focus:opacity-100 focus:outline-none focus:ring-2",
            "group-hover:opacity-100"
          ),
        },
      }}
      {...props}
    />
  );
};

// Toast icon components
const ToastIcon = {
  success: () => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15">
      <CheckCircle2 className="h-5 w-5 text-success" />
    </div>
  ),
  error: () => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15">
      <XCircle className="h-5 w-5 text-destructive" />
    </div>
  ),
  warning: () => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15">
      <AlertTriangle className="h-5 w-5 text-warning" />
    </div>
  ),
  info: () => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
      <Info className="h-5 w-5 text-primary" />
    </div>
  ),
  loading: () => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
    </div>
  ),
};

// Progress bar component for auto-dismiss timer
const ProgressBar = ({ duration, variant }: { duration: number; variant: 'success' | 'error' | 'warning' | 'info' }) => {
  const colorMap = {
    success: 'bg-success',
    error: 'bg-destructive',
    warning: 'bg-warning',
    info: 'bg-primary',
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50 overflow-hidden rounded-b-xl">
      <div
        className={cn("h-full", colorMap[variant])}
        style={{
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Close button component
const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-muted focus:opacity-100 focus:outline-none group-hover:opacity-100"
    aria-label="Close notification"
  >
    <X className="h-4 w-4 text-muted-foreground" />
  </button>
);

// Enhanced toast functions
interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  showProgress?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

const showToast = {
  success: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 4000);
    return toast.custom(
      (t) => (
        <div
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border border-success/20 bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "max-w-[380px]"
          )}
          onMouseEnter={() => toast.dismiss(t)}
          role="alert"
          aria-live="polite"
        >
          <ToastIcon.success />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{options.title}</p>
            {options.description && (
              <p className="text-sm text-muted-foreground mt-1">{options.description}</p>
            )}
            {options.action && (
              <button
                onClick={() => {
                  options.action?.onClick();
                  toast.dismiss(t);
                }}
                className="mt-2 text-xs font-medium text-success hover:text-success/80 transition-colors"
              >
                {options.action.label}
              </button>
            )}
          </div>
          <CloseButton onClick={() => toast.dismiss(t)} />
          {options.showProgress && !options.persistent && <ProgressBar duration={duration} variant="success" />}
        </div>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  error: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 6000);
    return toast.custom(
      (t) => (
        <div
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border border-destructive/20 bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "max-w-[380px]"
          )}
          role="alert"
          aria-live="assertive"
        >
          <ToastIcon.error />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{options.title}</p>
            {options.description && (
              <p className="text-sm text-muted-foreground mt-1">{options.description}</p>
            )}
            {options.action && (
              <button
                onClick={() => {
                  options.action?.onClick();
                  toast.dismiss(t);
                }}
                className="mt-2 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                {options.action.label}
              </button>
            )}
          </div>
          <CloseButton onClick={() => toast.dismiss(t)} />
          {options.showProgress && !options.persistent && <ProgressBar duration={duration} variant="error" />}
        </div>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  warning: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 5000);
    return toast.custom(
      (t) => (
        <div
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border border-warning/20 bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "max-w-[380px]"
          )}
          role="alert"
          aria-live="polite"
        >
          <ToastIcon.warning />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{options.title}</p>
            {options.description && (
              <p className="text-sm text-muted-foreground mt-1">{options.description}</p>
            )}
            {options.action && (
              <button
                onClick={() => {
                  options.action?.onClick();
                  toast.dismiss(t);
                }}
                className="mt-2 text-xs font-medium text-warning hover:text-warning/80 transition-colors"
              >
                {options.action.label}
              </button>
            )}
          </div>
          <CloseButton onClick={() => toast.dismiss(t)} />
          {options.showProgress && !options.persistent && <ProgressBar duration={duration} variant="warning" />}
        </div>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  info: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 4000);
    return toast.custom(
      (t) => (
        <div
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border border-primary/20 bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "max-w-[380px]"
          )}
          role="status"
          aria-live="polite"
        >
          <ToastIcon.info />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{options.title}</p>
            {options.description && (
              <p className="text-sm text-muted-foreground mt-1">{options.description}</p>
            )}
            {options.action && (
              <button
                onClick={() => {
                  options.action?.onClick();
                  toast.dismiss(t);
                }}
                className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {options.action.label}
              </button>
            )}
          </div>
          <CloseButton onClick={() => toast.dismiss(t)} />
          {options.showProgress && !options.persistent && <ProgressBar duration={duration} variant="info" />}
        </div>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  loading: (title: string, description?: string) => {
    return toast.custom(
      (t) => (
        <div
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
            "rounded-xl border bg-background p-4 shadow-lg",
            "animate-in slide-in-from-right-full fade-in-0 duration-300",
            "max-w-[380px]"
          )}
          role="status"
          aria-live="polite"
        >
          <ToastIcon.loading />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  },

  // Promise-based toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },

  // Dismiss a specific toast or all toasts
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export { Toaster, toast, showToast };
