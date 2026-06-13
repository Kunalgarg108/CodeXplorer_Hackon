import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div>
      <Header />
      <Hero />
      {isSignedIn && (
        <div className="text-center pb-10">
          <Link to="/dashboard">
            <Button className="rounded-full">Go to Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
