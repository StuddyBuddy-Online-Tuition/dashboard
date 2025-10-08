"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";

interface UserModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<User>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "admin" | "staff",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[800px] sm:p-6 border-secondary/20">
        <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
          <DialogTitle className="text-navy">
            {user.id ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="text-navy sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="email" className="text-navy sm:text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="role" className="text-navy sm:text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="sm:col-span-3 border-secondary/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2 mt-4 sm:flex-row sm:space-y-0 sm:mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full h-11 sm:w-auto sm:h-auto bg-accent text-navy hover:bg-accent/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 