import UsersPage from "@/components/users/users-page";
import { getAllUsers } from "@/server/queries/users";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp?.page ?? "1", 10) || 1, 1);
  const pageSizeRaw = parseInt(sp?.pageSize ?? "10", 10) || 10;
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
  const keyword = (sp as Record<string, string | undefined>)["keyword"]?.toString()?.trim() || undefined;

  const { users, totalCount } = await getAllUsers({ page, pageSize, keyword });

  return <UsersPage initialUsers={users} totalItems={totalCount} />;
}