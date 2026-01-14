import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import LogoutButton from "@/components/LogoutButton";
import ParticlesBackground from "@/components/ParticlesBackground";
import { CreateUserForm, UpdateUserForm, DeleteUserForm } from "@/components/AdminForms";

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
    if (!id) return { error: "User ID is required" };

    const body: Record<string, string> = {};
    const name = formData.get("editName")?.toString();
    const email = formData.get("editEmail")?.toString();
    const password = formData.get("editPassword")?.toString();
    const role = formData.get("editRole")?.toString();

    if (name) body.name = name;
    if (email) body.email = email;
    if (password) body.password = password;
    if (role) body.role = role;

    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update user" }));
        return { error: errorData.message || "Failed to update user" };
      }

      revalidatePath("/admin/users");
      return { success: true };
    } catch (error) {
      return { error: "Network error: Unable to update user" };
    }
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

    try {
      const res = await fetch(`${BACKEND_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create user" }));
        const errorMessage = Array.isArray(errorData.message) 
          ? errorData.message.join(", ") 
          : errorData.message || "Failed to create user";
        return { error: errorMessage };
      }

      revalidatePath("/admin/users");
      return { success: true };
    } catch (error) {
      return { error: "Network error: Unable to create user" };
    }
  }

  async function deleteUserAction(formData: FormData) {
    "use server";
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");
    const id = formData.get("userId")?.toString();
    if (!id) return { error: "User ID is required" };

    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete user" }));
        return { error: errorData.message || "Failed to delete user" };
      }

      revalidatePath("/admin/users");
      return { success: true };
    } catch (error) {
      return { error: "Network error: Unable to delete user" };
    }
  }

  return (
    <>
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-5xl border border-white/5 bg-surface p-8 shadow-glow-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-400">Admins can view, create, and delete users.</p>
        </div>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">Admin only</span>
      </div>

      <div className="mt-6 space-y-6">
        <div className="overflow-hidden border border-white/10 bg-primary/60">
          <table className="min-w-full text-sm text-slate-100">
            <thead className="bg-surface/80 text-slate-400">
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
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <UpdateUserForm action={updateUserAction} user={u} />
                    <DeleteUserForm action={deleteUserAction} userId={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-white/10 bg-primary/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Add User</h2>
          <CreateUserForm action={createUserAction} />
        </div>

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
    </>
  );
}
