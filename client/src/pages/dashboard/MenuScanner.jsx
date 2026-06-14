import React, { useEffect, useState } from "react";
import { Loader2, Upload, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { menuApi } from "@/lib/menuApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AiFoodRecommendations from "@/components/dashboard/AiFoodRecommendations";

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = ["completed", "failed"];

const normalizeStatus = (status) => {
  if (!status) return "Pending";
  const value = String(status).toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "processing") return "Processing";
  if (value === "completed") return "Completed";
  if (value === "failed") return "Failed";
  return status;
};

const statusStyles = {
  Pending: "text-mist bg-indigo/40 border-steel/30",
  Processing: "text-signal bg-signal/10 border-signal/30",
  Completed: "text-tag-lime bg-tag-lime/10 border-tag-lime/30",
  Failed: "text-tag-coral bg-tag-coral/10 border-tag-coral/30",
};

const extractMenuItems = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.menuItems)) return data.menuItems;
  if (Array.isArray(data?.menu_items)) return data.menu_items;
  if (Array.isArray(data?.result?.items)) return data.result.items;
  return [];
};

export default function MenuScanner() {
  const [restaurantName, setRestaurantName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return undefined;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    if (!jobId) return undefined;

    let cancelled = false;
    let intervalId;

    const pollJob = async () => {
      try {
        setPolling(true);
        const data = await menuApi.getJobStatus(jobId);
        if (cancelled) return;

        const status = normalizeStatus(data.status);
        setJobStatus(status);
        setError(null);

        if (status === "Completed") {
          setMenuItems(extractMenuItems(data));
          setPolling(false);
          clearInterval(intervalId);
        } else if (status === "Failed") {
          setError(data.message || data.error || "Menu processing failed.");
          setPolling(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to fetch job status.");
        setPolling(false);
        clearInterval(intervalId);
      }
    };

    pollJob();
    intervalId = setInterval(pollJob, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [jobId]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    setImageFile(file);
    setError(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!restaurantName.trim()) {
      setError("Restaurant name is required.");
      return;
    }
    if (!imageFile) {
      setError("Please select a menu image to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSuccess(false);
    setJobId(null);
    setJobStatus(null);
    setMenuItems([]);

    try {
      const data = await menuApi.uploadMenu(restaurantName.trim(), imageFile);
      setUploadSuccess(true);
      setJobId(data.jobId);
      setJobStatus("Pending");
      toast.success("Menu upload started.");
    } catch (err) {
      setError(err.message || "Upload failed.");
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const isProcessing =
    jobId && jobStatus && !TERMINAL_STATUSES.includes(String(jobStatus).toLowerCase());

  const canSubmit = restaurantName.trim() && imageFile && !uploading && !isProcessing;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <p className="eyebrow text-xs mb-2">Menu Scanner</p>
      <h2 className="display-section mb-2">Scan Restaurant Menu</h2>
      <p className="text-fog font-thin mb-8 max-w-2xl">
        Upload a menu image to extract item names, prices, and categories automatically.
      </p>

      <form onSubmit={handleUpload} className="neo-card space-y-6">
        <div>
          <label htmlFor="restaurant-name" className="text-fog text-sm font-thin block mb-2">
            Restaurant Name
          </label>
          <Input
            id="restaurant-name"
            placeholder="e.g. Bella Italia"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            disabled={uploading || isProcessing}
          />
        </div>

        <div>
          <label htmlFor="menu-image" className="text-fog text-sm font-thin block mb-2">
            Menu Image
          </label>
          <label
            htmlFor="menu-image"
            className="neo-card-dashed flex flex-col items-center justify-center gap-3 p-8 cursor-pointer"
          >
            <ImageIcon className="text-signal" size={28} />
            <span className="text-fog font-thin text-sm text-center">
              {imageFile ? imageFile.name : "Click to select a menu image"}
            </span>
            <span className="text-mist text-xs font-thin">PNG, JPG, or WEBP</span>
          </label>
          <input
            id="menu-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploading || isProcessing}
          />
        </div>

        {imagePreview && (
          <div>
            <p className="text-fog text-sm font-thin mb-2">Image Preview</p>
            <div className="rounded-card overflow-hidden border border-steel/30 bg-indigo/20">
              <img
                src={imagePreview}
                alt="Menu preview"
                className="w-full max-h-80 object-contain"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-btn border border-tag-coral/30 bg-tag-coral/10 p-4">
            <AlertCircle className="text-tag-coral shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-thin text-tag-coral">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Menu
            </>
          )}
        </Button>
      </form>

      {uploadSuccess && (
        <div className="mt-6 neo-card-glow flex items-center gap-3">
          <CheckCircle2 className="text-signal shrink-0" size={20} />
          <p className="text-paper font-thin">Processing Started</p>
        </div>
      )}

      {jobId && (
        <div className="mt-6 neo-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="eyebrow text-xs mb-1">Job Status</p>
              <p className="text-mist text-xs font-thin break-all">Job ID: {jobId}</p>
            </div>
            {jobStatus && (
              <span
                className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide ${
                  statusStyles[jobStatus] || statusStyles.Pending
                }`}
              >
                {polling && jobStatus !== "Completed" && jobStatus !== "Failed" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {jobStatus}
              </span>
            )}
          </div>

          {isProcessing && (
            <p className="text-fog text-sm font-thin">
              Checking status every 3 seconds...
            </p>
          )}
        </div>
      )}

      {jobStatus === "Completed" && (
        <div className="mt-6 neo-card">
          <p className="eyebrow text-xs mb-2">Extracted Menu Items</p>
          <div className="max-h-[600px] overflow-y-auto">
            <div className="hidden md:grid md:grid-cols-[1fr_120px_140px] gap-4 px-4 py-3 bg-indigo/40 rounded-btn mb-2 text-xs font-medium text-mist uppercase tracking-wide sticky top-0 z-10">
              <span>Item Name</span>
              <span>Price</span>
              <span>Category</span>
            </div>

            <div className="space-y-2 md:space-y-0">
              {menuItems.length > 0 ? (
                menuItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="md:grid md:grid-cols-[1fr_120px_140px] md:gap-4 md:items-center rounded-btn border border-steel/20 bg-deep/60 p-4 md:px-4 md:py-3 md:border-0 md:border-b md:border-steel/20 md:rounded-none md:bg-transparent last:md:border-b-0"
                  >
                    <div className="md:contents">
                      <div className="flex justify-between md:block gap-4 mb-2 md:mb-0">
                        <span className="text-mist text-xs uppercase md:hidden">Item Name</span>
                        <span className="text-paper font-thin text-sm">{item.name || "—"}</span>
                      </div>
                      <div className="flex justify-between md:block gap-4 mb-2 md:mb-0">
                        <span className="text-mist text-xs uppercase md:hidden">Price</span>
                        <span className="text-signal font-thin text-sm">
                          {item.price != null ? `$${item.price}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between md:block gap-4">
                        <span className="text-mist text-xs uppercase md:hidden">Category</span>
                        <span className="text-fog font-thin text-sm">{item.category || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-mist text-sm font-thin p-4 text-center">No menu items found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Food Recommendations */}
      <AiFoodRecommendations />
    </div>
  );
}
