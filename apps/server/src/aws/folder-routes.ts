import { createFolder , uploadFile , getFolder , getFolders  ,Move,getAllFoldersByOwner} from "./folder-handler";

import { Router } from "express";

const folderrouter = Router();


folderrouter.post('/createFolder',createFolder);
folderrouter.post('/uploadFile',uploadFile);
folderrouter.get('/getFolder/:folderId',getFolder);
folderrouter.get('/getFolders',getFolders);
folderrouter.post('/Move',Move);
folderrouter.get('/getAllFoldersByOwner',getAllFoldersByOwner);

export default folderrouter;