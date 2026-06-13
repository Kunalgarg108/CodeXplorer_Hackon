import React from "react";
import { Button } from "@/components/ui/button";

export default function Upgrade() {
  return (
    <div className="p-6 md:p-10">
      <p className="eyebrow text-xs mb-2">Plans</p>
      <h2 className="display-section mb-10">Upgrade</h2>
      <div className="mx-auto max-w-3xl grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="neo-card p-8">
          <div className="text-center">
            <p className="eyebrow text-xs text-fog mb-2">Starter</p>
            <p className="font-display font-semibold text-4xl text-paper">$20</p>
            <span className="text-mist text-sm font-thin">/month</span>
          </div>
          <ul className="mt-8 space-y-3 text-fog font-thin text-sm">
            <li>✓ 10 users included</li>
            <li>✓ 2GB of storage</li>
            <li>✓ Email support</li>
            <li>✓ Help center access</li>
          </ul>
          <Button variant="outline" className="mt-8 w-full">Get Started</Button>
        </div>
        <div className="neo-card-glow p-8 border-signal/30">
          <div className="text-center">
            <p className="eyebrow text-xs mb-2">Pro</p>
            <p className="font-display font-semibold text-4xl text-paper">$30</p>
            <span className="text-mist text-sm font-thin">/month</span>
          </div>
          <ul className="mt-8 space-y-3 text-fog font-thin text-sm">
            <li>✓ 20 users included</li>
            <li>✓ 5GB of storage</li>
            <li>✓ Email support</li>
            <li>✓ Help center access</li>
            <li>✓ Phone support</li>
            <li>✓ Community access</li>
          </ul>
          <Button className="mt-8 w-full">Get Started</Button>
        </div>
      </div>
    </div>
  );
}
