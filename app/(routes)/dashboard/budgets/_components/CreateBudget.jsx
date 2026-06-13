"use client";
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function CreateBudget({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const { user } = useUser();

  const onCreateBudget = async () => {
    const result = await db
      .insert(Budgets)
      .values({
        name: name,
        amount: amount,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        icon: emojiIcon,
      })
      .returning({ insertedId: Budgets.id });

    if (result) {
      refreshData();
      toast("New Budget Created!");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div
            style={{
              background: "var(--color-deep-surface)",
              border: "2px dashed rgba(17,38,59,0.8)",
              borderRadius: "24px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 150,
              gap: "12px",
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(28,108,255,0.5)";
              e.currentTarget.style.background = "rgba(28,108,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(17,38,59,0.8)";
              e.currentTarget.style.background = "var(--color-deep-surface)";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "rgba(28,108,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} style={{ color: "var(--color-signal-blue)" }} />
            </div>
            <span
              style={{
                color: "var(--color-fog)",
                fontSize: "14px",
                fontWeight: 300,
              }}
            >
              Create New Budget
            </span>
          </div>
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
              Create New Budget
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-5">
                {/* Emoji picker trigger */}
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
                    className="dark-input"
                    placeholder="e.g. Home Decor"
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
                    className="dark-input"
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
                onClick={() => onCreateBudget()}
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
                Create Budget
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
