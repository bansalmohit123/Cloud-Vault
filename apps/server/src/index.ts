import express from 'express';
import cors from 'cors';
// import awsRoutes from './aws/awsRoutes';
import router from './aws/upload-routes';
import folderrouter from './aws/folder-routes';
import featuresrouter from './aws/features-routes';
import bodyParser from 'body-parser';
const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/api", router);
// app.use('/aws', awsRoutes);
app.use('/', folderrouter);
app.use('/', featuresrouter);


app.get('/', (req, res) => {
    res.send('Hello, world!');
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});