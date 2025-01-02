"use server";
import axios from "axios";

const SERVER_URL = process.env.SERVER_URL;


export const createFolder = async (name: string, ownerId: string, parentId: string) => {
    const response = await axios.post(
        `${SERVER_URL}/createFolder`,
        { name, ownerId, parentId }
    );
    return response.data;
};


export const uploadFile = async (name: string, type: string, size: number, ownerId: string, folderId: string, url: string) => {
    const response = await axios.post(
        `${SERVER_URL}/uploadFile`,
        { name, type, size, ownerId, folderId, url }
    );
    return response.data;
};

export const getFolder = async (folderId: string) => {
    const response = await axios.get(
        `${SERVER_URL}/getFolder/${folderId}`
    );
    return response.data;
};

export const getFolders = async () => {
    const response = await axios.get(
        `${SERVER_URL}/getFolders`
    );
    return response.data;
};

export const Move = async (srcid: string, destinationid: string) => {
    const response = await axios.post(
        `${SERVER_URL}/Move`,
        { srcid, destinationid }
    );
    return response.data;
};

export const getAllFoldersByOwner = async (ownerId: string) => {
    const response = await axios.get(
        `${SERVER_URL}/getAllFoldersByOwner`,
        { params: { ownerId } }
    );
    return response.data;
};
