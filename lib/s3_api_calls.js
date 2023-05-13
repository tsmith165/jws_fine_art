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

const image_type_to_folder_name_dict = {
    'cover': 'pieces',       // Cover = pieces
    'cover_image': 'pieces', // Cover Image = pieces
    'piece': 'pieces',       // Piece = pieces
    'piece_image': 'pieces', // Piece Image = pieces
    'extra': 'extra',        // Extra = extra
    'extra_image': 'extra',  // Extra Image = extra
    'progress': 'progress',  // Progress = progress
    'progress_image': 'progress', // Progress Image = progress   
}

export async function generate_upload_url(image_name, image_type) {
    image_name = image_name.toString().toLowerCase().replace(" ","_")
    image_type = image_type.toString().toLowerCase().replace(" ","_")

    const folder_name = image_type_to_folder_name_dict[image_type]

    const params = ({
        Bucket: bucket_name,
        Key: `${folder_name}/${image_name}`,
        Expires: 60
    })

    console.log("Params (Next Line):")
    console.log(params)

    const upload_url = await s3.getSignedUrlPromise('putObject', params)
    console.log(`Returned Upload URL: ${upload_url}`)

    return upload_url
}
