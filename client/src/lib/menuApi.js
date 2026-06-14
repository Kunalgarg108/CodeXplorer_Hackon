import axios from "axios";

const menuClient = axios.create({
  baseURL: "/api/menu",
});

menuClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Request failed";
  throw new Error(message);
};

export const menuApi = {
  uploadMenu: async (restaurantName, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("restaurant_name", restaurantName);
      formData.append("image", imageFile);

      const { data } = await menuClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getJobStatus: async (jobId) => {
    try {
      const { data } = await menuClient.get(`/job/${jobId}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },
};
