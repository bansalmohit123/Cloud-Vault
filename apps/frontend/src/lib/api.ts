"use server";
import axios from "axios";

const SERVER_URL = process.env.SERVER_URL;

export const generateSinglePresignedUrl = async (fileName: string) => {
    const response = await axios.post(
        `${SERVER_URL}/generate-single-presigned-url`,
        { fileName }
    );
    console.log('response', response)
    return response.data.url;
};

export const startMultipartUpload = async (fileName: string, contentType: string) => {
    const response = await axios.post(
        `${SERVER_URL}/start-multipart-upload`,
        { fileName, contentType }
    );
    console.log('response', response)
    return response.data.uploadId;
};

export const generatePresignedUrls = async (
    fileName: string,
    uploadId: string,
    partNumbers: number
) => {
    const response = await axios.post(
        `${SERVER_URL}/generate-presigned-url`,
        { fileName, uploadId, partNumbers }
    );
    return response.data.presignedUrls;
};

export const completeMultipartUpload = async (
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[]
) => {
    const response = await axios.post(
        `${SERVER_URL}/complete-multipart-upload`,
        { fileName, uploadId, parts }
    );
    return response.data;
};



export const generatePresignedURLget = async (
    fileName: string,
    folderId: string,
    expiresIn: number
) => {
    const response = await axios.post(
        `${SERVER_URL}/api/get-file`,
        { fileName, folderId, expiresIn }
    );
    return response.data.presignedUrl;
}

