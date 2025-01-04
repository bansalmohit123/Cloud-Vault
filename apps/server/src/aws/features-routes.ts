import {renameFileHandler , deletefile ,deleteFolderHandler,renameFolderHandler  } from './features-handler'

import { Router } from 'express';

const featuresrouter = Router();

featuresrouter.post('/renameFile',renameFileHandler);
featuresrouter.post('/deletefile',deletefile);
featuresrouter.post('/deleteFolder',deleteFolderHandler);
featuresrouter.post('/renameFolder',renameFolderHandler);

export default featuresrouter;