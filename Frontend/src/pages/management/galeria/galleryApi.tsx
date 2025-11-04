import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api/uploads`;

const getToken = () => localStorage.getItem('adminToken');

const getConfig = () => {
    const token = getToken();
    if (!token) throw new Error("No hay token de autenticación.");
    return { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
};

export const getUploadSignature = async (publicId: string) => {
    const config = getConfig();
    const { data } = await axios.post(`${API_URL}/sign`, { publicId }, config);
    return data;
};

export const listGalleryImages = async (cursor?: string) => {
    const config = getConfig();
    const url = cursor ? `${API_URL}/list?cursor=${cursor}` : `${API_URL}/list`;
    const { data } = await axios.get(url, config);
    return data;
};

export const deleteGalleryImage = async (simplePublicId: string) => {
    const config = getConfig();
    const { data } = await axios.delete(`${API_URL}/${simplePublicId}`, config);
    return data;
};