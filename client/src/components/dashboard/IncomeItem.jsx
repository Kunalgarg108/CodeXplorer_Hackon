export default function IncomeItem({ budget }) {
  return (
    <div className="neo-card hover:shadow-neo-glow transition-shadow cursor-pointer h-[170px]">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <span className="text-2xl p-3 bg-indigo rounded-tag shadow-neo">{budget?.icon}</span>
          <div>
            <h2 className="font-display font-medium text-paper">{budget.name}</h2>
            <p className="text-xs text-mist font-thin">Monthly income</p>
          </div>
        </div>
        <h2 className="font-display font-semibold text-tag-lime text-lg">${budget.amount}</h2>
      </div>
    </div>
  );
}
