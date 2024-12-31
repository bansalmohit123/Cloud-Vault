import express from 'express';
import cors from 'cors';
import awsRoutes from './aws/awsRoutes';
const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());


app.use('/aws', awsRoutes);



app.get('/', (req, res) => {
    res.send('Hello, world!');
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});