import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CreateIncomes from "@/components/dashboard/CreateIncomes";
import IncomeItem from "@/components/dashboard/IncomeItem";

export default function Incomes() {
  const { user } = useAuth();
  const [incomelist, setIncomelist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const getIncomelist = async () => {
    const result = await api.getIncomes();
    setIncomelist(result);
    setLoaded(true);
  };

  useEffect(() => {
    if (user) getIncomelist();
  }, [user]);

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <p className="eyebrow text-[10px] sm:text-xs mb-1 sm:mb-2">Income</p>
      <h2 className="display-section text-2xl sm:text-3xl mb-4 sm:mb-8">My Income Streams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateIncomes refreshData={getIncomelist} />
        {loaded ? (
          incomelist.length > 0 ? (
            incomelist.map((income) => (
              <IncomeItem income={income} refreshData={getIncomelist} key={income.id} />
            ))
          ) : (
            <div className="neo-card p-6 flex items-center justify-center col-span-full">
              <p className="text-fog text-sm font-medium">No income sources added yet.</p>
            </div>
          )
        ) : (
          [1, 2, 3].map((item) => (
            <div key={item} className="w-full skeleton-pulse h-[170px] rounded-card" />
          ))
        )}
      </div>
    </div>
  );
}
