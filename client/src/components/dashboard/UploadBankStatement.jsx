import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BankStatementUpload({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bankStatementId, setBankStatementId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password-protected state
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileExtension)) {
      setError("Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setCurrentFile(file);
    handleUpload(file);
  };

  const handleUpload = async (file, pwd = "") => {
    setIsLoading(true);
    setError(null);
    setPasswordError(null);
    setUploadProgress({ status: "uploading", message: "Uploading file..." });

    try {
      const uploadResponse = await api.uploadBankStatement(file, pwd);
      setBankStatementId(uploadResponse.bankStatementId);

      setUploadProgress({ status: "parsing", message: "Parsing statement..." });

      const previewResponse = await api.getUploadPreview(
        uploadResponse.bankStatementId
      );
      setPreview(previewResponse);
      setUploadProgress(null);
      setPasswordRequired(false);
      setPasswordError(null);
    } catch (err) {
      if (err.message === "PASSWORD_REQUIRED") {
        setPasswordRequired(true);
        setPasswordError(null);
      } else if (err.message === "INVALID_PASSWORD") {
        setPasswordRequired(true);
        setPasswordError("Incorrect password. Please try again.");
      } else {
        setError(err.message);
      }
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!bankStatementId) return;

    setIsLoading(true);
    try {
      const response = await api.confirmUpload(bankStatementId);
      setShowConfirm(false);
      setIsOpen(false);
      setPreview(null);
      setBankStatementId(null);
      setPasswordRequired(false);
      setPasswordVal("");
      setPasswordError(null);
      setCurrentFile(null);
      onSuccess?.(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!bankStatementId) return;

    setIsLoading(true);
    try {
      await api.cancelUpload(bankStatementId);
      setPreview(null);
      setBankStatementId(null);
      setError(null);
      setPasswordRequired(false);
      setPasswordVal("");
      setPasswordError(null);
      setCurrentFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        Upload Bank Statement
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setError(null);
          setUploadProgress(null);
          setPreview(null);
          setBankStatementId(null);
          setPasswordRequired(false);
          setPasswordVal("");
          setPasswordError(null);
          setCurrentFile(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Bank Statement</DialogTitle>
          </DialogHeader>

          {passwordRequired ? (
            <div className="space-y-4">
              <div className="text-sm text-yellow-600 bg-yellow-50/10 border border-yellow-500/20 p-3 rounded-xl flex items-start gap-2">
                <Lock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <span>This bank statement spreadsheet is password protected. Please enter the password to decrypt and parse it.</span>
              </div>
              {passwordError && (
                <div className="text-sm text-[#ff4433] bg-[#ff4433]/10 border border-[#ff4433]/20 p-2 rounded-xl">
                  {passwordError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-fog text-xs font-semibold block">File Password</label>
                <Input
                  type="password"
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  placeholder="Enter file password"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordRequired(false);
                    setPasswordVal("");
                    setPasswordError(null);
                    setCurrentFile(null);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpload(currentFile, passwordVal);
                  }}
                  disabled={isLoading || !passwordVal.trim()}
                  className="flex-1"
                >
                  {isLoading ? "Decrypting..." : "Submit Password"}
                </Button>
              </div>
            </div>
          ) : !preview ? (
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-[#ff4433] bg-[#ff4433]/10 border border-[#ff4433]/20 p-2 rounded-xl">
                  {error}
                </div>
              )}

              {uploadProgress ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="mt-4 text-sm text-fog">
                    {uploadProgress.message}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#11263b] hover:border-[#1c6cff]/50 rounded-2xl p-8 text-center bg-[#010d1e]/20 transition-all">
                  <label className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex justify-center mb-1 text-primary"><FileSpreadsheet className="w-10 h-10" /></div>
                      <div className="text-sm font-medium text-paper">
                        Click to upload Excel / CSV
                      </div>
                      <div className="text-xs text-[#64748b]">Max 50MB</div>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#010d1e]/60 border border-[#11263b]/20 rounded-xl p-3 text-sm text-paper">
                <p className="font-semibold mb-1 text-primary">File: {preview.fileName}</p>
                <p className="text-fog text-xs">
                  {preview.transactionCount} transactions
                  {preview.duplicatesFound > 0 &&
                    ` (${preview.duplicatesFound} duplicates)`}
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto border border-[#11263b]/30 rounded-xl p-2 text-xs bg-[#010d1e]/20">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#11263b]/30 text-fog">
                      <th className="text-left py-1.5 font-medium">Date</th>
                      <th className="text-left py-1.5 font-medium">Merchant</th>
                      <th className="text-right py-1.5 pr-4 font-medium">Amount</th>
                      <th className="text-left py-1.5 font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.transactions.map((txn, idx) => (
                      <tr key={idx} className="border-b border-[#11263b]/20 hover:bg-[#001533]/50 text-paper">
                        <td className="py-1.5">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="py-1.5 truncate max-w-[120px]">{txn.merchant}</td>
                        <td className="text-right py-1.5 pr-4 font-medium text-primary">
                          ₹{txn.amount.toFixed(2)}
                        </td>
                        <td className="py-1.5 text-fog">{txn.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Confirm & Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#010d1e] border border-steel/30 rounded-2xl">
          <AlertDialogTitle className="text-paper">Confirm Upload</AlertDialogTitle>
          <AlertDialogDescription className="text-fog">
            This will save {preview?.transactionCount || 0} transactions to your
            account.
            {preview?.duplicatesFound > 0 && (
              <>
                <br />
                <span className="text-[#ff8833] font-medium">
                  {preview.duplicatesFound} duplicate transactions will be
                  skipped.
                </span>
              </>
            )}
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel className="bg-steel/30 hover:bg-steel/50 text-paper border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="bg-[#1c6cff] hover:bg-[#1c6cff]/90 text-white font-semibold">
              {isLoading ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BankStatementUpload;
