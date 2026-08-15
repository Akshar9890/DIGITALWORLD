"use client";



import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { User, Phone, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[6-9]\d{9}$/.test(val.replace(/[^0-9]/g, "")),
      "Enter a valid 10-digit Indian phone number"
    ),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      phone: (session?.user as any)?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsProfileSubmitting(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setProfileError(result.error || "Failed to update profile");
        return;
      }

      setProfileSuccess(true);
      await update();
    } catch {
      setProfileError("Failed to connect to server");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsPasswordSubmitting(true);
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setPasswordError(result.error || "Failed to change password");
        return;
      }

      setPasswordSuccess(true);
      resetPassword();
    } catch {
      setPasswordError("Failed to connect to server");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-headline-md text-white">Account Settings</h2>

      {/* Profile Section */}
      <div className="bento-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
          <User size={20} className="text-tertiary" />
          <h3 className="font-headline-sm text-white">Profile Information</h3>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Full Name</label>
              <input
                {...registerProfile("name")}
                className={`input-field ${profileErrors.name ? "border-status-error" : ""}`}
              />
              {profileErrors.name && (
                <span className="input-error">{profileErrors.name.message}</span>
              )}
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
                <input
                  value={session?.user?.email || ""}
                  disabled
                  className="input-field pl-10 opacity-60 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-gray mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div>
            <label className="input-label">Phone Number (Optional)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
              <input
                {...registerProfile("phone")}
                className={`input-field pl-10 ${profileErrors.phone ? "border-status-error" : ""}`}
                placeholder="9876543210"
              />
            </div>
            {profileErrors.phone && (
              <span className="input-error">{profileErrors.phone.message}</span>
            )}
          </div>

          {profileError && (
            <div className="flex items-center gap-2 rounded-control bg-error-container/20 border border-status-error/30 px-4 py-3 text-sm text-status-error">
              <AlertCircle size={16} /> {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-control bg-status-success/20 border border-status-success/30 px-4 py-3 text-sm text-status-success">
              <CheckCircle2 size={16} /> Profile updated successfully.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" isLoading={isProfileSubmitting}>
              SAVE CHANGES
            </Button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bento-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
          <Lock size={20} className="text-tertiary" />
          <h3 className="font-headline-sm text-white">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="input-label">Current Password</label>
            <input
              {...registerPassword("currentPassword")}
              type="password"
              className={`input-field ${passwordErrors.currentPassword ? "border-status-error" : ""}`}
              placeholder="Enter current password"
            />
            {passwordErrors.currentPassword && (
              <span className="input-error">{passwordErrors.currentPassword.message}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label">New Password</label>
              <input
                {...registerPassword("newPassword")}
                type="password"
                className={`input-field ${passwordErrors.newPassword ? "border-status-error" : ""}`}
                placeholder="Min. 8 characters"
              />
              {passwordErrors.newPassword && (
                <span className="input-error">{passwordErrors.newPassword.message}</span>
              )}
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                {...registerPassword("confirmPassword")}
                type="password"
                className={`input-field ${passwordErrors.confirmPassword ? "border-status-error" : ""}`}
                placeholder="Re-enter new password"
              />
              {passwordErrors.confirmPassword && (
                <span className="input-error">{passwordErrors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-control bg-error-container/20 border border-status-error/30 px-4 py-3 text-sm text-status-error">
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-control bg-status-success/20 border border-status-success/30 px-4 py-3 text-sm text-status-success">
              <CheckCircle2 size={16} /> Password changed successfully.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPasswordSubmitting}>
              CHANGE PASSWORD
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bento-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
          <Mail size={20} className="text-tertiary" />
          <h3 className="font-headline-sm text-white">Account Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-technical">
          <div>
            <span className="text-slate-gray">Account Type</span>
            <p className="text-white font-bold mt-1 capitalize">
              {session?.user?.role === "wholesale_approved"
                ? "Wholesale (B2B)"
                : session?.user?.role === "wholesale_pending"
                ? "Wholesale (Pending)"
                : "Retail"}
            </p>
          </div>
          <div>
            <span className="text-slate-gray">Member Since</span>
            <p className="text-white font-bold mt-1">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
