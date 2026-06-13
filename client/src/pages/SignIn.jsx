import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md neo-card p-8">
        <p className="eyebrow text-xs mb-3">Welcome back</p>
        <h1 className="font-display font-semibold text-2xl text-paper mb-2">Sign In</h1>
        <p className="text-fog font-thin text-sm mb-8">Access your FinanSmart dashboard</p>
        <div className="space-y-5">
          <div>
            <label className="text-fog text-sm font-thin block mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-fog text-sm font-thin block mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
        <p className="text-center mt-6 text-sm text-mist font-thin">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-signal hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
