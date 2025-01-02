
// import { GetObjectCommand, S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// require('dotenv').config();
// const s3 = new S3Client({ 
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     }
//  });


// export async function getObjectURL(key: string){
//     const command = new GetObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: key
//     });
//     const url =await  getSignedUrl(s3,command,{expiresIn: 3600});
//     return url;
//  }
  

//  export async function putObject(filename: string, contentType: string){
//     const command = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `/uploads/${filename}`,
//         ContentType: contentType
      
//     });

//     const url =await  getSignedUrl(s3,command,{expiresIn: 3600});
//     return url;
//  }
 
//  export async function listObjects(key: string){
//     const command = new ListObjectsV2Command({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         key: '/'
//     });
//     const result = await s3.send(command);
//     console.log(result);

    
//  }

// async function init(){
//     // const url = await getObjectURL("file.txt");
//     // const url = await putObject(`image-${Date.now()}`,"image/jpg");
//     // console .log(url);

//     // await listObjects();
// }
// init();
