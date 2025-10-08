"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user";
import { users as mockUsersData } from "@/data/users";
import PaginationControls from "@/components/common/pagination";
import UserModal from "./user-modal";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setUsers(mockUsersData);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          searchQuery === "" ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [users, searchQuery]
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

  const openModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
    } else {
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

  const saveUser = (user: User) => {
    setUsers((prev) => {
      const index = prev.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        const newUsers = [...prev];
        newUsers[index] = user;
        return newUsers;
      }
      return [...prev, user];
    });
    closeModal();
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
        <UserModal user={selectedUser} onClose={closeModal} onSave={saveUser} />
      )}
    </div>
  );
} 