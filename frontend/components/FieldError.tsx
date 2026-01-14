interface FieldErrorProps {
  message?: string | string[];
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  
  const messages = Array.isArray(message) ? message : [message];
  
  return (
    <div className="mt-1">
      {messages.map((msg, idx) => (
        <p key={idx} className="text-xs text-red-400">
          {msg}
        </p>
      ))}
    </div>
  );
}
