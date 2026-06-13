import React from "react";

export default function Upgrade() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8">
        <div className="rounded-2xl border border-indigo-600 p-6 shadow-sm ring-1 ring-indigo-600 sm:order-last sm:px-8 lg:p-12">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Pro</h2>
            <p className="mt-2 sm:mt-4">
              <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">30$</strong>
              <span className="text-sm font-medium text-gray-700">/month</span>
            </p>
          </div>
          <ul className="mt-6 space-y-2 text-gray-700">
            <li>✓ 20 users included</li>
            <li>✓ 5GB of storage</li>
            <li>✓ Email support</li>
            <li>✓ Help center access</li>
            <li>✓ Phone support</li>
            <li>✓ Community access</li>
          </ul>
          <button className="mt-8 block w-full rounded-full border border-indigo-600 bg-indigo-600 px-12 py-3 text-center text-sm font-medium text-white">
            Get Started
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Starter</h2>
            <p className="mt-2 sm:mt-4">
              <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">20$</strong>
              <span className="text-sm font-medium text-gray-700">/month</span>
            </p>
          </div>
          <ul className="mt-6 space-y-2 text-gray-700">
            <li>✓ 10 users included</li>
            <li>✓ 2GB of storage</li>
            <li>✓ Email support</li>
            <li>✓ Help center access</li>
          </ul>
          <button className="mt-8 block w-full rounded-full border border-indigo-600 bg-white px-12 py-3 text-center text-sm font-medium text-indigo-600">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
