import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import WellnessSurvey from "@/components/WellnessSurvey";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast("Account created!");
      setShowSurvey(true);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleFinishSurvey = () => {
    navigate("/dashboard");
  };

  if (showSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight p-4">
        <WellnessSurvey onComplete={handleFinishSurvey} onSkip={handleFinishSurvey} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md neo-card p-8">
        <p className="eyebrow text-xs mb-3">Get started</p>
        <h1 className="font-display font-semibold text-2xl text-paper mb-2">Sign Up</h1>
        <p className="text-fog font-thin text-sm mb-8">Create your FinanSmart account</p>
        <div className="space-y-5">
          <div>
            <label className="text-fog text-sm font-thin block mb-1">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-fog text-sm font-thin block mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-fog text-sm font-thin block mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
        <p className="text-center mt-6 text-sm text-mist font-thin">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-signal hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
