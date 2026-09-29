import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

const uploadOnCloudinary = async (localFilePath, folder = "gifts") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: `surpriseNepal/${folder}`,
        });

        await fs.unlink(localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);

        try {
            await fs.unlink(localFilePath);
        } catch {
            // File already removed or doesn't exist
            console.error("Failed to delete temporary file:", error.message);
        }

        return null;
    }
};

export { uploadOnCloudinary };