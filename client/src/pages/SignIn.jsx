import React, { useState, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-midnight p-4 relative overflow-y-auto overflow-x-hidden">
      {/* Spline 3D Background with hue-rotate and saturation to match midnight blue/signal blue theme */}
      <div className="fixed inset-0 z-0 select-none">
        <Suspense fallback={<div className="absolute inset-0 bg-midnight" />}>
          <div className={`w-full h-full hue-rotate-[110deg] brightness-120 saturate-140 transition-opacity duration-1000 ease-out ${splineLoaded ? "opacity-75" : "opacity-0"}`}>
            <Spline 
              scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode" 
              className="w-full h-full"
              onLoad={() => setSplineLoaded(true)}
            />
          </div>
        </Suspense>
        {/* Blue/indigo gradient overlay to blend background with UI */}
        <div className="absolute inset-0 bg-gradient-to-tr from-midnight/80 via-[#001533]/40 to-[#00215e]/50 pointer-events-none" />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md neo-card p-8 z-10 relative pointer-events-auto">
        <p className="eyebrow text-xs mb-3">Welcome back</p>
        <h1 className="font-display font-semibold text-2xl text-paper mb-2">Sign In</h1>
        <p className="text-fog font-thin text-sm mb-8">Access your PocketBuddy dashboard</p>
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

