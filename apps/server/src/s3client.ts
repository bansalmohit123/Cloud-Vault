import { S3Client } from "@aws-sdk/client-s3";
import Dotenv from "dotenv";

Dotenv.config();


const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
  });


export default s3Client;