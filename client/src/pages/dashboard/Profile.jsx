import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, Calendar, GraduationCap, Clock, Shield, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    college: "",
    course: "",
    semester: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        college: user.college || "",
        course: user.course || "",
        semester: user.semester || "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth || null,
        college: form.college.trim(),
        course: form.course.trim(),
        semester: form.semester ? Number(form.semester) : null,
      };
      const data = await api.updateProfile(payload);
      if (setUser && data.user) {
        setUser(data.user);
      }
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
      college: user?.college || "",
      course: user?.course || "",
      semester: user?.semester || "",
    });
    setEditing(false);
  };

  const initial = user?.name?.[0]?.toUpperCase() || "?";
  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <p className="eyebrow text-xs mb-3">Account</p>
      <h2 className="font-display font-bold text-[36px] leading-tight text-white mb-1">
        My Profile
      </h2>
      <p className="text-[16px] font-thin text-white/60 mb-10">
        Manage your personal information.
      </p>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-steel/20 bg-gradient-to-r from-signal/10 via-deep to-indigo/10 backdrop-blur-sm p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-signal flex items-center justify-center text-white text-[40px] font-display font-bold shadow-[0_0_30px_rgba(28,108,255,0.3)]">
            {initial}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-[28px] font-bold text-white font-display">{user?.name || "Student"}</h3>
            <p className="text-[16px] text-white/60 font-thin mt-1">{user?.email || "—"}</p>
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              className="shrink-0 gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-steel/20 bg-deep/80 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display font-bold text-[20px] text-white">Personal Information</h4>
            {editing && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1.5">
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-signal" /> Full Name
              </label>
              {editing ? (
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your full name"
                />
              ) : (
                <p className="text-[16px] text-white font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                  {user?.name || "—"}
                </p>
              )}
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-[#00acfe]" /> Email Address
                <span className="text-[10px] text-white/30 ml-1">(read only)</span>
              </label>
              <p className="text-[16px] text-white/70 font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                {user?.email || "—"}
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#ff8833]" /> Date of Birth
              </label>
              {editing ? (
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full bg-indigo/20 border border-steel/30 rounded-lg px-3 py-2.5 text-[15px] text-white font-thin focus:outline-none focus:border-signal/50 transition-colors"
                />
              ) : (
                <p className="text-[16px] text-white font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                  {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                    : "Not set"}
                </p>
              )}
            </div>

            {/* College */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#a855f7]" /> College / University
              </label>
              {editing ? (
                <Input
                  value={form.college}
                  onChange={(e) => handleChange("college", e.target.value)}
                  placeholder="e.g. NIT Kurukshetra"
                />
              ) : (
                <p className="text-[16px] text-white font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                  {user?.college || "Not set"}
                </p>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#a855f7]" /> Course
              </label>
              {editing ? (
                <Input
                  value={form.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                  placeholder="e.g. B.Tech CSE"
                />
              ) : (
                <p className="text-[16px] text-white font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                  {user?.course || "Not set"}
                </p>
              )}
            </div>

            {/* Semester */}
            <div>
              <label className="text-[13px] text-white/50 font-thin flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#a855f7]" /> Semester
              </label>
              {editing ? (
                <select
                  value={form.semester}
                  onChange={(e) => handleChange("semester", e.target.value)}
                  className="w-full bg-indigo/20 border border-steel/30 rounded-lg px-3 py-2.5 text-[15px] text-white font-thin focus:outline-none focus:border-signal/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-deep text-white">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-deep text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[16px] text-white font-normal py-2 px-3 rounded-lg bg-indigo/10 border border-steel/10">
                  {user?.semester ? `Semester ${user.semester}` : "Not set"}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-steel/20 bg-deep/80 backdrop-blur-sm p-6 h-fit"
        >
          <h4 className="font-display font-bold text-[20px] text-white mb-6">Account</h4>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-tag-lime/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-tag-lime" />
              </div>
              <div>
                <p className="text-[12px] text-white/40 font-thin">Account Created</p>
                <p className="text-[15px] text-white font-normal">{createdDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-signal/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-signal" />
              </div>
              <div>
                <p className="text-[12px] text-white/40 font-thin">Last Login</p>
                <p className="text-[15px] text-white font-normal">Today</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#00cc4b]/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#00cc4b]" />
              </div>
              <div>
                <p className="text-[12px] text-white/40 font-thin">Login Method</p>
                <p className="text-[15px] text-white font-normal">Email & Password</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
