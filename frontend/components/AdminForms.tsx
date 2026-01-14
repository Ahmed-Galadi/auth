"use client";

import { useFormState, useFormStatus } from "react-dom";
import FormError from "./FormError";
import Alert from "./Alert";

interface AdminFormState {
  error?: string;
  success?: boolean;
}

type ServerAction = (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;

function SubmitButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  
  const baseClasses = "px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";
  const variantClasses = variant === "danger"
    ? "rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20"
    : "border border-accent/50 bg-accent/10 text-accent hover:bg-accent/20";
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${baseClasses} ${variantClasses}`}
    >
      {pending ? "..." : children}
    </button>
  );
}

export function DeleteUserForm({ 
  action, 
  userId 
}: { 
  action: (formData: FormData) => Promise<AdminFormState>; 
  userId: number;
}) {
  const wrappedAction: ServerAction = async (prevState, formData) => action(formData);
  const [state, formAction] = useFormState(wrappedAction, {});

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton variant="danger">Delete</SubmitButton>
      {state?.error && (
        <div className="mt-2">
          <Alert variant="error">{state.error}</Alert>
        </div>
      )}
    </form>
  );
}

export function UpdateUserForm({ 
  action, 
  user 
}: { 
  action: (formData: FormData) => Promise<AdminFormState>; 
  user: { id: number; name: string; email: string; role: string };
}) {
  const wrappedAction: ServerAction = async (prevState, formData) => action(formData);
  const [state, formAction] = useFormState(wrappedAction, {});

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="editName" value={user.name} />
      <input type="hidden" name="editEmail" value={user.email} />
      <input type="hidden" name="editRole" value={user.role} />
      <SubmitButton>Edit</SubmitButton>
      {state?.error && (
        <div className="mt-2">
          <Alert variant="error">{state.error}</Alert>
        </div>
      )}
    </form>
  );
}

export function CreateUserForm({ 
  action 
}: { 
  action: (formData: FormData) => Promise<AdminFormState>;
}) {
  const wrappedAction: ServerAction = async (prevState, formData) => action(formData);
  const [state, formAction] = useFormState(wrappedAction, {});

  return (
    <div>
      {state?.error && <FormError message={state.error} className="mb-4" />}
      {state?.success && <Alert variant="success" className="mb-4">User created successfully!</Alert>}
      
      <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Name</label>
          <input 
            name="name" 
            required 
            className="w-full border border-white/10 bg-primary/60 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:ring-2 focus:ring-accent/20" 
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            className="w-full border border-white/10 bg-primary/60 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:ring-2 focus:ring-accent/20" 
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Password (min 6 characters)</label>
          <input 
            type="password" 
            name="password" 
            required 
            minLength={6}
            className="w-full border border-white/10 bg-primary/60 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:ring-2 focus:ring-accent/20" 
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Role</label>
          <select 
            name="role" 
            defaultValue="USER" 
            className="w-full border border-white/10 bg-primary/60 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <CreateUserButton />
        </div>
      </form>
    </div>
  );
}

function CreateUserButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary shadow-glow hover:bg-accent-dark disabled:opacity-50"
    >
      {pending ? "Adding User..." : "Add User"}
    </button>
  );
}
