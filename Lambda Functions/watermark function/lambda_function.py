import boto3
import os
import uuid
from PIL import Image, ImageDraw, ImageFont
from botocore.exceptions import ClientError

s3 = boto3.client('s3')

def get_unique_key(bucket, base_key):
    name_part, extension = os.path.splitext(base_key)
    counter = 1
    unique_key = base_key
    while True:
        try:
            s3.head_object(Bucket=bucket, Key=unique_key)
            unique_key = f"{name_part}({counter}){extension}"
            counter += 1
        except ClientError as e:
            if e.response['Error']['Code'] == "404":
                return unique_key
            else:
                raise e

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        
        if not key.startswith('uploads/') or '_watermarked' in key:
            continue

        original_filename = os.path.basename(key)
        name_part, extension = os.path.splitext(original_filename)
        desired_name = f"watermarked/{name_part}_watermarked{extension}"
        final_key = get_unique_key(bucket, desired_name)
        
        download_path = f'/tmp/{uuid.uuid4()}{original_filename}'
        upload_path = f'/tmp/{os.path.basename(final_key)}'
        s3.download_file(bucket, key, download_path)
        
        with Image.open(download_path).convert("RGBA") as base_img:
            # CREATE TEXT LAYER
            txt_layer = Image.new('RGBA', base_img.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(txt_layer)
            
            #SCALE: 50% of image height for high visibility
            font_size = int(base_img.height * 0.50)
            
            try:
                # Lambda usually has some fonts in this path. 
                # If this fails, it falls back to default.
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                # If no TTF is found, we use the default and a large scale factor
                font = ImageFont.load_default()
                print("TTF Font not found, using default. Watermark may be small.")

            watermark_text = "R.G"
            
            # Position Calculation
            left, top, right, bottom = draw.textbbox((0, 0), watermark_text, font=font)
            text_width = right - left
            text_height = bottom - top

            # Padding: 5% of width
            padding = int(base_img.width * 0.05)
            position = (base_img.width - text_width - padding, 
                        base_img.height - text_height - padding)
            
            # Draw the text in bright red
            draw.text(position, watermark_text, fill=(255, 0, 0, 255), font=font)
            
            # Combine and save
            out = Image.alpha_composite(base_img, txt_layer)
            out.convert("RGB").save(upload_path, quality=95)

        s3.upload_file(upload_path, bucket, final_key)
        s3.delete_object(Bucket=bucket, Key=key)
        
        print(f"Uploaded: {final_key}")

    return {'statusCode': 200, 'body': 'Watermarked successfully'}