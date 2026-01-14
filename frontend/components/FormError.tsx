interface FormErrorProps {
  message?: string | string[];
  className?: string;
}

export default function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  
  const messages = Array.isArray(message) ? message : [message];
  
  return (
    <div className={`rounded border border-red-500/30 bg-red-500/10 px-4 py-3 ${className}`}>
      {messages.map((msg, idx) => (
        <p key={idx} className="text-sm text-red-200">
          {msg}
        </p>
      ))}
    </div>
  );
}
