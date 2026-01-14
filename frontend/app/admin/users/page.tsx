import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import LogoutButton from "@/components/LogoutButton";

type Role = "USER" | "ADMIN";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

async function fetchUsers(token: string): Promise<UserRow[]> {
  const res = await fetch(`${BACKEND_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) redirect("/dashboard");
  if (!res.ok) {
    throw new Error("Failed to load users");
  }
  return res.json();
}

export default async function AdminUsersPage() {
  const token = cookies().get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  const payload: { role?: Role } = jwtDecode(token);
  if (payload.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await fetchUsers(token);

  async function updateUserAction(formData: FormData) {
    "use server";
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");
    const id = formData.get("userId")?.toString();
    if (!id) return;

    const body: Record<string, string> = {};
    const name = formData.get("editName")?.toString();
    const email = formData.get("editEmail")?.toString();
    const password = formData.get("editPassword")?.toString();
    const role = formData.get("editRole")?.toString();

    if (name) body.name = name;
    if (email) body.email = email;
    if (password) body.password = password;
    if (role) body.role = role;

    const res = await fetch(`${BACKEND_URL}/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to update user");
    }

    revalidatePath("/admin/users");
  }

  async function createUserAction(formData: FormData) {
    "use server";
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");

    const body = {
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      role: (formData.get("role")?.toString() as Role) || "USER",
    };

    const res = await fetch(`${BACKEND_URL}/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to create user");
    }

    revalidatePath("/admin/users");
  }

  async function deleteUserAction(formData: FormData) {
    "use server";
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");
    const id = formData.get("userId")?.toString();
    if (!id) return;

    const res = await fetch(`${BACKEND_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to delete user");
    }

    revalidatePath("/admin/users");
  }

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-400">Admins can view, create, and delete users.</p>
        </div>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">Admin only</span>
      </div>

      <div className="mt-6 space-y-6">
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-sm text-slate-100">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800/60">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-2">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <form action={updateUserAction} className="inline">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="editName" value={u.name} />
                      <input type="hidden" name="editEmail" value={u.email} />
                      <input type="hidden" name="editRole" value={u.role} />
                      <button
                        type="submit"
                        className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/20"
                      >
                        Edit
                      </button>
                    </form>
                    <form action={deleteUserAction} className="inline">
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add User</h2>
          <form action={createUserAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input name="name" required className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input type="email" name="email" required className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input type="password" name="password" required className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Role</label>
              <select name="role" defaultValue="USER" className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-2 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-glow hover:brightness-105"
              >
                Add User
              </button>
            </div>
          </form>
        </div>

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
