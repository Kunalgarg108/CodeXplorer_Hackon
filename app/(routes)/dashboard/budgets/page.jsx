import React from 'react'
import BudgetList from './_components/BudgetList'

function Budget() {
  return (
    <div style={{ background: "var(--color-midnight-canvas)", minHeight: "100vh" }}>
      <BudgetList />
    </div>
  )
}

export default Budget