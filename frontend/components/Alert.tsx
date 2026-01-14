interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ variant = 'info', children, className = "" }: AlertProps) {
  const variants = {
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
    success: 'border-green-500/30 bg-green-500/10 text-green-200',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
    info: 'border-accent/30 bg-accent/10 text-accent',
  };

  return (
    <div className={`rounded border px-4 py-3 ${variants[variant]} ${className}`}>
      <div className="text-sm">{children}</div>
    </div>
  );
}
