"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      startTransition(() => {
        router.push("/login");
        router.refresh();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || isPending}
      className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800/70 disabled:opacity-70"
    >
      {loading || isPending ? "Logging out…" : "Logout"}
    </button>
  );
}
