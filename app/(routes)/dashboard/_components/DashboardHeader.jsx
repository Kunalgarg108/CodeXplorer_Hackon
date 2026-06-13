import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardHeader() {
  return (
    <div
      style={{
        background: "var(--color-deep-surface)",
        borderBottom: "1px solid rgba(17,38,59,0.7)",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <UserButton afterSignOutUrl='/' />
    </div>
  )
}

export default DashboardHeader