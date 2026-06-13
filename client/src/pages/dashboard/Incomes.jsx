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
    <div className="p-10">
      <h2 className="font-bold text-3xl">My Income Streams</h2>
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateIncomes refreshData={getIncomelist} />
        {incomelist?.length > 0
          ? incomelist.map((income) => <IncomeItem budget={income} key={income.id} />)
          : [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse" />
            ))}
      </div>
    </div>
  );
}
