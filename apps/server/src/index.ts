import express from 'express';
import cors from 'cors';
// import awsRoutes from './aws/awsRoutes';
import router from './aws/upload-routes';
import featuresrouter from './aws/features-routes';
import { downloadFolderHandler } from './aws/awsController';
import bodyParser from 'body-parser';
import serverless from 'serverless-http';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));

// Middleware
app.use(bodyParser.json());


app.use("/api", router);
// app.use('/aws', awsRoutes);
app.use('/', featuresrouter);
app.use('/api/folder/download/:folderId', downloadFolderHandler);


app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
}
);


// export const handler = serverless(app);

