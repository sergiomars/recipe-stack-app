import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return <AdminDashboard adminEmail={user.email ?? "Admin"} />;
}
