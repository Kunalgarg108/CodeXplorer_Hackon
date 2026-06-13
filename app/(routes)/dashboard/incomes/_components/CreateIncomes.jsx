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
import { Incomes } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function CreateIncomes({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const { user } = useUser();

  const onCreateIncomes = async () => {
    const result = await db
      .insert(Incomes)
      .values({
        name: name,
        amount: amount,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        icon: emojiIcon,
      })
      .returning({ insertedId: Incomes.id });

    if (result) {
      refreshData();
      toast("New Income Source Created!");
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
              minHeight: 100,
              gap: "12px",
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,204,75,0.5)";
              e.currentTarget.style.background = "rgba(0,204,75,0.05)";
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
                background: "rgba(0,204,75,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} style={{ color: "var(--color-tag-lime)" }} />
            </div>
            <span style={{ color: "var(--color-fog)", fontSize: "14px", fontWeight: 300 }}>
              Create New Income Source
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
              Create New Income Source
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
                    Source Name
                  </label>
                  <Input
                    placeholder="e.g. Youtube"
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
                    Monthly Amount
                  </label>
                  <Input
                    type="number"
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
                onClick={() => onCreateIncomes()}
                style={{
                  background: "var(--color-tag-lime)",
                  color: "#000",
                  border: "none",
                  borderRadius: "12px",
                  padding: "13px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: !(name && amount) ? "not-allowed" : "pointer",
                  opacity: !(name && amount) ? 0.4 : 1,
                  marginTop: "4px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Create Income Source
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateIncomes;
