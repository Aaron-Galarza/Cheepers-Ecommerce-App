import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const UPLOAD_PRESET = 'cheepers_gallery';
const FOLDER_NAME = 'cheepers_admin_gallery';

export const generateCloudinarySignature = (publicId: string) => {
    const timestamp = Math.round((new Date().getTime() / 1000));
    
    const paramsToSign = {
        public_id: `${FOLDER_NAME}/${publicId}`,
        timestamp: timestamp,
        upload_preset: UPLOAD_PRESET,
    };
    
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    return {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        folder: FOLDER_NAME,
        uploadPreset: UPLOAD_PRESET
    };
};

export const deleteCloudinaryImage = async (publicId: string) => {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
};

export const listCloudinaryImages = async (maxResults: number = 10, nextCursor?: string) => {
    const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: FOLDER_NAME,
        max_results: maxResults,
        direction: 'desc',
        next_cursor: nextCursor,
    });
    
    return {
        resources: result.resources,
        nextCursor: result.next_cursor,
        totalCount: result.total_count
    };
};

export default cloudinary;