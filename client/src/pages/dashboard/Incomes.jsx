import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CreateIncomes from "@/components/dashboard/CreateIncomes";
import IncomeItem from "@/components/dashboard/IncomeItem";

export default function Incomes() {
  const { user } = useAuth();
  const [incomelist, setIncomelist] = useState([]);

  const getIncomelist = async () => {
    const result = await api.getIncomes();
    setIncomelist(result);
  };

  useEffect(() => {
    if (user) getIncomelist();
  }, [user]);

  return (
    <div className="p-6 md:p-10">
      <p className="eyebrow text-xs mb-2">Income</p>
      <h2 className="display-section mb-8">My Income Streams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateIncomes refreshData={getIncomelist} />
        {incomelist?.length > 0
          ? incomelist.map((income) => <IncomeItem budget={income} key={income.id} />)
          : [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="w-full skeleton-pulse h-[150px]" />
            ))}
      </div>
    </div>
  );
}
