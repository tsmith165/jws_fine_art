import aws from 'aws-sdk';

const region = 'us-west-1';
const bucket_name = 'jwsfineartpieces';
const access_key_id = process.env.AWS_ACCESS_KEY_ID;
const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
    region,
    access_key_id,
    secret_access_key,
    signatureVersion: 'v4'
});

export async function generate_upload_url(image_name) {
    image_name = image_name.toString().toLowerCase().replace(" ","_")

    const params = ({
        Bucket: bucket_name,
        Key: `pieces/${image_name}`,
        Expires: 60
    })

    console.log("Params (Next Line):")
    console.log(params)

    const upload_url = await s3.getSignedUrlPromise('putObject', params)
    console.log(`Returned Upload URL: ${upload_url}`)

    return upload_url
}
