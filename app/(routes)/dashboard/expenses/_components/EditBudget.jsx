"use client";
import { PenBox } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo?.icon);
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    const result = await db
      .update(Budgets)
      .set({ name, amount, icon: emojiIcon })
      .where(eq(Budgets.id, budgetInfo.id))
      .returning();

    if (result) {
      refreshData();
      toast("Budget Updated!");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "rgba(28,108,255,0.12)",
              border: "1px solid rgba(28,108,255,0.3)",
              color: "var(--color-signal-blue)",
              fontSize: "14px",
              fontWeight: 400,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,108,255,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(28,108,255,0.12)")}
          >
            <PenBox size={14} />
            Edit
          </button>
        </DialogTrigger>

        <DialogContent
          style={{
            background: "var(--color-deep-surface)",
            border: "1px solid rgba(17,38,59,0.8)",
            borderRadius: "24px",
            color: "var(--color-paper-white)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: "var(--color-paper-white)",
              }}
            >
              Update Budget
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-5">
                <button
                  onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                  style={{
                    fontSize: "24px",
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    background: "var(--color-indigo-surface)",
                    border: "1px solid rgba(17,38,59,0.8)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {emojiIcon}
                </button>
                <div className="absolute z-20">
                  <EmojiPicker
                    open={openEmojiPicker}
                    onEmojiClick={(e) => {
                      setEmojiIcon(e.emoji);
                      setOpenEmojiPicker(false);
                    }}
                    theme="dark"
                  />
                </div>

                <div className="mt-4">
                  <label style={{ color: "var(--color-fog)", fontSize: "12px", fontWeight: 400, display: "block", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Budget Name
                  </label>
                  <Input
                    placeholder="e.g. Home Decor"
                    defaultValue={budgetInfo?.name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      background: "var(--color-indigo-surface)",
                      border: "1px solid rgba(17,38,59,0.8)",
                      color: "var(--color-paper-white)",
                      borderRadius: "12px",
                    }}
                  />
                </div>

                <div className="mt-4">
                  <label style={{ color: "var(--color-fog)", fontSize: "12px", fontWeight: 400, display: "block", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Budget Amount
                  </label>
                  <Input
                    type="number"
                    defaultValue={budgetInfo?.amount}
                    placeholder="e.g. 5000"
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      background: "var(--color-indigo-surface)",
                      border: "1px solid rgba(17,38,59,0.8)",
                      color: "var(--color-paper-white)",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <button
                disabled={!(name && amount)}
                onClick={() => onUpdateBudget()}
                className="btn-signal mt-4 w-full"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  opacity: !(name && amount) ? 0.4 : 1,
                  cursor: !(name && amount) ? "not-allowed" : "pointer",
                }}
              >
                Update Budget
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditBudget;
