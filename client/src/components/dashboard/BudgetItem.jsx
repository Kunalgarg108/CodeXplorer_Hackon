import { Link } from "react-router-dom";

export default function BudgetItem({ budget }) {
  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };

  return (
    <Link to={`/dashboard/expenses/${budget?.id}`}>
      <div className="neo-card hover:shadow-neo-glow transition-shadow cursor-pointer h-[170px]">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-3 items-center">
            <span className="text-2xl p-3 bg-indigo rounded-tag shadow-neo">{budget?.icon}</span>
            <div>
              <h2 className="font-display font-medium text-paper">{budget.name}</h2>
              <p className="text-xs text-mist font-thin">{budget.totalItem} Item</p>
            </div>
          </div>
          <h2 className="font-display font-semibold text-signal text-lg">${budget.amount}</h2>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-mist font-thin">${budget.totalSpend || 0} Spend</span>
            <span className="text-xs text-mist font-thin">${budget.amount - (budget.totalSpend || 0)} Remaining</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${calculateProgressPerc()}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
