import React, { useEffect, useState } from "react";
import { PenBox } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo.icon);
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    await api.updateBudget(budgetInfo.id, { name, amount, icon: emojiIcon });
    refreshData();
    toast("Budget Updated!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex gap-2">
          <PenBox className="w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Budget</DialogTitle>
          <DialogDescription>
            <div className="mt-5">
              <Button variant="secondary" className="text-lg" onClick={() => setOpenEmojiPicker(!openEmojiPicker)}>
                {emojiIcon}
              </Button>
              <div className="absolute z-20">
                <EmojiPicker open={openEmojiPicker} onEmojiClick={(e) => { setEmojiIcon(e.emoji); setOpenEmojiPicker(false); }} />
              </div>
              <div className="mt-4">
                <label className="text-fog text-sm font-thin block mb-1">Budget Name</label>
                <Input placeholder="e.g. Home Decor" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="text-fog text-sm font-thin block mb-1">Budget Amount</label>
                <Input type="number" value={amount} placeholder="e.g. 5000" onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button disabled={!(name && amount)} onClick={onUpdateBudget} className="mt-5 w-full">
              Update Budget
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
