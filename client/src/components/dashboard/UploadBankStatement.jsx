import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress({ status: "uploading", message: "Uploading file..." });

    try {
      const uploadResponse = await api.uploadBankStatement(file);
      setBankStatementId(uploadResponse.bankStatementId);

      setUploadProgress({ status: "parsing", message: "Parsing PDF..." });

      const previewResponse = await api.getUploadPreview(
        uploadResponse.bankStatementId
      );
      setPreview(previewResponse);
      setUploadProgress(null);
    } catch (err) {
      setError(err.message);
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Bank Statement</DialogTitle>
          </DialogHeader>

          {!preview ? (
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {uploadProgress ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="mt-4 text-sm text-gray-600">
                    {uploadProgress.message}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <label className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-2xl">📄</div>
                      <div className="text-sm font-medium">
                        Click to upload PDF
                      </div>
                      <div className="text-xs text-gray-500">Max 50MB</div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
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
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium mb-1">File: {preview.fileName}</p>
                <p className="text-gray-600">
                  {preview.transactionCount} transactions
                  {preview.duplicatesFound > 0 &&
                    ` (${preview.duplicatesFound} duplicates)`}
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded p-2 text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Date</th>
                      <th className="text-left py-1">Merchant</th>
                      <th className="text-right py-1">Amount</th>
                      <th className="text-left py-1">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.transactions.map((txn, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-1">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="py-1 truncate">{txn.merchant}</td>
                        <td className="text-right py-1">
                          ₹{txn.amount.toFixed(2)}
                        </td>
                        <td className="py-1 text-gray-600">{txn.category}</td>
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
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Upload</AlertDialogTitle>
          <AlertDialogDescription>
            This will save {preview?.transactionCount || 0} transactions to your
            account.
            {preview?.duplicatesFound > 0 && (
              <>
                <br />
                <span className="text-yellow-600 font-medium">
                  {preview.duplicatesFound} duplicate transactions will be
                  skipped.
                </span>
              </>
            )}
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BankStatementUpload;
