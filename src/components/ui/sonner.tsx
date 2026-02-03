import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors={false}
      closeButton={false}
      duration={4000}
      gap={12}
      visibleToasts={5}
      offset={20}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "pointer-events-auto",
          title: "",
          description: "",
        },
      }}
      {...props}
    />
  );
};

// Premium toast container with hover pause functionality
const ToastContainer = ({ 
  children, 
  variant, 
  duration,
  onDismiss,
  toastId,
  showProgress = true,
}: { 
  children: React.ReactNode;
  variant: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration: number;
  onDismiss: () => void;
  toastId: string | number;
  showProgress?: boolean;
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const animationRef = useRef<number>();

  const accentColors = {
    success: 'hsl(var(--success))',
    error: 'hsl(var(--destructive))',
    warning: 'hsl(var(--warning))',
    info: 'hsl(var(--primary))',
    loading: 'hsl(var(--muted-foreground))',
  };

  const borderAccents = {
    success: 'border-l-success',
    error: 'border-l-destructive',
    warning: 'border-l-warning',
    info: 'border-l-primary',
    loading: 'border-l-muted-foreground',
  };

  useEffect(() => {
    if (duration === Infinity || !showProgress) return;

    const animate = () => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, isPaused, showProgress]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    remainingTimeRef.current = (progress / 100) * duration;
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden",
        "rounded-lg border border-l-[3px] bg-background/95 backdrop-blur-sm",
        "p-4 shadow-lg transition-all duration-200",
        "hover:shadow-xl hover:translate-y-[-1px]",
        "animate-in slide-in-from-right-full fade-in-0 duration-200 ease-out",
        "data-[removed=true]:animate-out data-[removed=true]:slide-out-to-right-full data-[removed=true]:fade-out-0 data-[removed=true]:duration-150",
        "max-w-[360px] min-w-[300px]",
        borderAccents[variant]
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      {children}
      
      {/* Close button */}
      <button
        onClick={onDismiss}
        className={cn(
          "absolute right-3 top-3 rounded-md p-1",
          "opacity-0 transition-all duration-150",
          "hover:bg-muted/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/20",
          "group-hover:opacity-100"
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Premium progress bar */}
      {showProgress && duration !== Infinity && variant !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/30 overflow-hidden">
          <div
            className="h-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              backgroundColor: accentColors[variant],
              opacity: isPaused ? 0.5 : 0.8,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Premium icon components with refined styling
const ToastIcon = {
  success: () => (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/20">
      <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={2.5} />
    </div>
  ),
  error: () => (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
      <XCircle className="h-4 w-4 text-destructive" strokeWidth={2.5} />
    </div>
  ),
  warning: () => (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 ring-1 ring-warning/20">
      <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={2.5} />
    </div>
  ),
  info: () => (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
      <Info className="h-4 w-4 text-primary" strokeWidth={2.5} />
    </div>
  ),
  loading: () => (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" strokeWidth={2.5} />
    </div>
  ),
};

// Toast content component
const ToastContent = ({
  title,
  description,
  action,
  variant,
  onActionClick,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant: 'success' | 'error' | 'warning' | 'info' | 'loading';
  onActionClick?: () => void;
}) => {
  const actionColors = {
    success: 'text-success hover:text-success/80',
    error: 'text-destructive hover:text-destructive/80',
    warning: 'text-warning hover:text-warning/80',
    info: 'text-primary hover:text-primary/80',
    loading: 'text-muted-foreground',
  };

  return (
    <div className="flex-1 min-w-0 pr-6">
      <p className="text-[13px] font-medium text-foreground leading-tight">{title}</p>
      {description && (
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      )}
      {action && (
        <button
          onClick={onActionClick}
          className={cn(
            "mt-2 text-[12px] font-medium transition-colors",
            actionColors[variant]
          )}
        >
          {action.label} →
        </button>
      )}
    </div>
  );
};

// Enhanced toast options interface
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

// Premium toast functions
const showToast = {
  success: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 3500);
    return toast.custom(
      (t) => (
        <ToastContainer
          variant="success"
          duration={duration}
          onDismiss={() => toast.dismiss(t)}
          toastId={t}
          showProgress={options.showProgress ?? true}
        >
          <ToastIcon.success />
          <ToastContent
            title={options.title}
            description={options.description}
            action={options.action}
            variant="success"
            onActionClick={() => {
              options.action?.onClick();
              toast.dismiss(t);
            }}
          />
        </ToastContainer>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  error: (options: ToastOptions) => {
    // Errors persist by default until dismissed
    const duration = options.persistent !== false ? Infinity : (options.duration ?? 6000);
    return toast.custom(
      (t) => (
        <ToastContainer
          variant="error"
          duration={duration}
          onDismiss={() => toast.dismiss(t)}
          toastId={t}
          showProgress={options.showProgress ?? false}
        >
          <ToastIcon.error />
          <ToastContent
            title={options.title}
            description={options.description}
            action={options.action}
            variant="error"
            onActionClick={() => {
              options.action?.onClick();
              toast.dismiss(t);
            }}
          />
        </ToastContainer>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  warning: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 5000);
    return toast.custom(
      (t) => (
        <ToastContainer
          variant="warning"
          duration={duration}
          onDismiss={() => toast.dismiss(t)}
          toastId={t}
          showProgress={options.showProgress ?? true}
        >
          <ToastIcon.warning />
          <ToastContent
            title={options.title}
            description={options.description}
            action={options.action}
            variant="warning"
            onActionClick={() => {
              options.action?.onClick();
              toast.dismiss(t);
            }}
          />
        </ToastContainer>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  info: (options: ToastOptions) => {
    const duration = options.persistent ? Infinity : (options.duration ?? 3500);
    return toast.custom(
      (t) => (
        <ToastContainer
          variant="info"
          duration={duration}
          onDismiss={() => toast.dismiss(t)}
          toastId={t}
          showProgress={options.showProgress ?? true}
        >
          <ToastIcon.info />
          <ToastContent
            title={options.title}
            description={options.description}
            action={options.action}
            variant="info"
            onActionClick={() => {
              options.action?.onClick();
              toast.dismiss(t);
            }}
          />
        </ToastContainer>
      ),
      { duration, onDismiss: options.onDismiss }
    );
  },

  loading: (title: string, description?: string) => {
    return toast.custom(
      (t) => (
        <ToastContainer
          variant="loading"
          duration={Infinity}
          onDismiss={() => toast.dismiss(t)}
          toastId={t}
          showProgress={false}
        >
          <ToastIcon.loading />
          <ToastContent
            title={title}
            description={description}
            variant="loading"
          />
        </ToastContainer>
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
