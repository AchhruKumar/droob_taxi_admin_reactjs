import toast from "react-hot-toast";
import { UPLOAD_FILE } from "../endPoints";
import { postRequest } from "../http-client/axiosClient";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await postRequest(`${UPLOAD_FILE.UPLOAD}`, formData);

    return {
      fileKey: response.data.fileKey,
      fileExt: response.data.fileExt,
      url: `${import.meta.env.VITE_PUBLIC_IMAGE_URL}/${response.data.fileKey}.${response.data.fileExt}`,
    };
  } catch (err) {
    toast.error("File upload failed. Please try again.");
    console.error("Upload error:", err);
    throw err;
  }
};
