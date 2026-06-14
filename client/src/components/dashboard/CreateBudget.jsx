import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateBudget({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const onCreateBudget = async () => {
    await api.createBudget({ name, amount, icon: emojiIcon });
    refreshData();
    toast("New Budget Created!");
    setName("");
    setAmount("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="neo-card-dashed p-10 items-center flex flex-col min-h-[150px] justify-center">
          <span className="text-3xl text-signal font-bold">+</span>
          <span className="text-paper font-medium mt-2">Create New Budget</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
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
                <Input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button disabled={!(name && amount)} onClick={onCreateBudget} className="mt-5 w-full">
              Create Budget
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
