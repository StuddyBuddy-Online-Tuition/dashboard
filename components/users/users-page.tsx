"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user";
import PaginationControls from "@/components/common/pagination";
import UserModal from "./user-modal";

export default function UsersPage({ initialUsers, totalItems: totalItemsFromServer }: { initialUsers?: User[]; totalItems?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPageFromUrl = Math.max(parseInt(searchParams?.get("page") ?? "1", 10) || 1, 1);
  const initialPageSizeFromUrl = Math.max(parseInt(searchParams?.get("pageSize") ?? "10", 10) || 10, 1);

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers ?? []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPageFromUrl);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSizeFromUrl);

  useEffect(() => {
    if (initialUsers) setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Server provides the correct slice; don't filter or slice client-side
  const filteredUsers = useMemo(() => users, [users]);

  const totalItems = totalItemsFromServer ?? users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers;

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-primary/20 text-primary-dark border-primary/30"
      : "bg-secondary/20 text-secondary-dark border-secondary/30";
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  // Sync state from URL if it changes (e.g., back/forward nav or server nav)
  useEffect(() => {
    const p = Math.max(parseInt(searchParams?.get("page") ?? "1", 10) || 1, 1);
    const ps = Math.max(parseInt(searchParams?.get("pageSize") ?? "10", 10) || 10, 1);
    if (p !== currentPage) setCurrentPage(p);
    if (ps !== itemsPerPage) setItemsPerPage(ps);
    const kw = searchParams?.get("keyword") ?? "";
    if (kw !== searchQuery) setSearchQuery(kw);
  }, [searchParams]);

  // Sync pagination and keyword to URL search params
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    sp.set("page", String(currentPage));
    sp.set("pageSize", String(itemsPerPage));
    const kw = (searchQuery ?? "").trim();
    if (kw) {
      sp.set("keyword", kw);
    } else {
      sp.delete("keyword");
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [currentPage, itemsPerPage, pathname, router, searchParams, searchQuery]);

  const openModal = (user?: User) => {
    if (user) {
      setIsCreating(false);
      setSelectedUser(user);
    } else {
      setIsCreating(true);
      setSelectedUser({
        id: Date.now().toString(),
        name: "",
        email: "",
        role: "staff",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const saveUser = async (user: User, opts?: { password?: string }) => {
    try {
      if (isCreating) {
        const res = await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: user.name, email: user.email, role: user.role, password: opts?.password ?? "" }),
        });
        if (!res.ok) throw new Error(await res.text());
        const created: User = await res.json();
        setUsers((prev) => [created, ...prev]);
      } else {
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }),
        });
        if (!res.ok) throw new Error(await res.text());
        const updated: User = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
      closeModal();
    } catch (_e) {
      // no-op minimal handling per scope
    }
  };

  const handleChangePassword = async (userId: string, newPassword: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password: newPassword }),
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
    } catch (_e) {
      // no-op minimal handling per scope
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-navy">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage users who can access the dashboard.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Total: {totalItems} | Showing: {startIndex + 1}-
            {Math.min(endIndex, totalItems)}
          </span>
          <Button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-accent text-navy hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="border-secondary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-secondary/20 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-md border border-secondary/20">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-secondary/10 to-primary/10">
                <tr className="border-b border-secondary/20">
                  <th className="py-3 px-4 text-left font-medium text-navy">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-navy">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-navy">
                    Role
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-navy">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-24 text-center">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-secondary/10 bg-white hover:bg-secondary/5"
                    >
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(u.role)}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(u)}
                          className="text-navy hover:bg-secondary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="block lg:hidden space-y-3">
            {paginatedUsers.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                No users found.
              </p>
            ) : (
              paginatedUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border border-secondary/20 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-navy">{u.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <Badge className={getRoleColor(u.role)}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(u)}
                      className="border-secondary/20 text-navy hover:bg-secondary/10"
                    >
                      <Edit className="h-4 w-4 mr-1" /> View/Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardContent>
      </Card>

      {isModalOpen && selectedUser && (
        <UserModal
          user={selectedUser}
          isNew={isCreating}
          onClose={closeModal}
          onSave={saveUser}
          onChangePassword={handleChangePassword}
        />
      )}
    </div>
  );
} 