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
  isNew: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function UserModal({ user, isNew, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<User>(user);
  const [createPassword, setCreatePassword] = useState<string>("");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [changeNewPassword, setChangeNewPassword] = useState<string>("");
  const [changeConfirmPassword, setChangeConfirmPassword] = useState<string>("");

  const isAddPasswordInvalid = isNew && createPassword.length < 8;
  const isChangePasswordInvalid =
    changeNewPassword.length < 8 || changeNewPassword !== changeConfirmPassword;

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isNew && createPassword.length < 8) {
      return;
    }
    onSave(formData);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[800px] sm:p-6 border-secondary/20">
          <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
            <DialogTitle className="text-navy">
              {isNew ? "Add New User" : "Edit User"}
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
              {isNew && (
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="password" className="text-navy sm:text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="sm:col-span-3 border-secondary/20"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex-col space-y-2 mt-4 sm:flex-row sm:space-y-0 sm:space-x-2 sm:mt-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10 bg-transparent"
              >
                Cancel
              </Button>
              {!isNew && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10"
                >
                  Change Password
                </Button>
              )}
              <Button
                type="submit"
                className="w-full h-11 sm:w-auto sm:h-auto bg-accent text-navy hover:bg-accent/90"
                disabled={isAddPasswordInvalid}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[500px] sm:p-6 border-secondary/20">
          <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
            <DialogTitle className="text-navy">Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="new-password" className="text-navy sm:text-right">
                New Password
              </Label>
              <Input
                id="new-password"
                name="new-password"
                type="password"
                value={changeNewPassword}
                onChange={(e) => setChangeNewPassword(e.target.value)}
                className="sm:col-span-3 border-secondary/20"
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="confirm-password" className="text-navy sm:text-right">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                value={changeConfirmPassword}
                onChange={(e) => setChangeConfirmPassword(e.target.value)}
                className="sm:col-span-3 border-secondary/20"
                required
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2 mt-4 sm:flex-row sm:space-y-0 sm:mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
              className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full h-11 sm:w-auto sm:h-auto bg-accent text-navy hover:bg-accent/90"
              disabled={isChangePasswordInvalid}
              onClick={() => {
                setIsChangePasswordOpen(false);
                setChangeNewPassword("");
                setChangeConfirmPassword("");
              }}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 