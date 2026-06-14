import { useState } from "react";
import TransactionFilters from "@/components/dashboard/TransactionFilters";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import TransactionList from "@/components/dashboard/TransactionList";
import UploadBankStatement from "@/components/dashboard/UploadBankStatement";

export default function TransactionsPage() {
  const [filters, setFilters] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction Analysis
          </h1>
          <UploadBankStatement onSuccess={() => window.location.reload()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TransactionFilters onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <AnalyticsDashboard filters={filters} />
            <TransactionList filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
