import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect, send_file
from werkzeug.exceptions import abort
from PIL import Image, ImageSequence
import io
app = Flask(__name__)
import os
@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/3D')
def latest_3d_loader():
    frame_path = "/SSC/amy@ai3d.com/archery/19-08-2022_09-44-30_amy/processed/processed_pose_00023"
    return render_template('3dviewer.html',
        frame_path=frame_path)

@app.route('/PoseTransfer')
def pose_transfer():
    return render_template('posetransfer.html')

@app.route('/DeformSkeleton')
def deform_skeleton():
    return render_template('deformskeleton.html')

@app.route('/VRMode')
def vr_mode():
    return render_template('vrmode.html')

@app.route('/FBXAnimated')
def fbx_animate():
    return render_template('fbx_animate.html')

@app.route('/Animate')
def animate():
    return render_template('animate.html')

@app.route('/Interactive')
def interactive():
    return render_template('interactive.html')

@app.route('/GifViewer')
def GifViewer():
    return render_template('UIDesignTest.html')

@app.route('/upload', methods=['PUT'])
def upload_file():
    file = request.data
    with open('static/user_data/model/' + request.args.get('filename'), 'wb') as f:
        f.write(file)
    return 'File Finish Uploaded.' 

# Route to append content to a file
@app.route('/append_to_file', methods=['POST'])
def append_to_file():
    content = request.form.get('content')  # Get the content from the request

    if content:
        file_path = 'static/user_data/List.txt'  # Specify the path to your file
        try:
            with open(file_path, 'a') as file:
                file.write(content + '\n')  # Append content as a new line
            return 'Content appended to the file successfully.'
        except Exception as e:
            return f'Error appending to the file: {str(e)}'
    else:
        return 'Content not provided in the request.'

@app.route('/upload_Gif', methods=['POST'])
def upload_Gif():
    print("processing gif")
    try:
        # Initialize a counter to keep track of the image index
        image_index = 0
        image_list = []

        # Iterate through the uploaded images
        while f'image_{image_index}' in request.files:
            # Get the current image file
            image_file = request.files[f'image_{image_index}']

            if image_file:
                # Open the image with PIL
                img = Image.open(image_file)

                # Append the image to the list
                image_list.append(img)
                image_index += 1
            else:
                return f'No image file received for image_{image_index}', 400

        if image_index > 0:
            gif_name = request.form.get('gifName', 'output.gif')  # Default name if not provided
            print(int(request.form.get('fps', 30)) )
            fps = int(request.form.get('fps', 30))  # Default to 10 fps if not provided
            loop = int(request.form.get('loop', 0))  # Default to no looping if not provided
            gif_name=gif_name+".gif"
            result = convert_images_to_gif(image_list, gif_name, fps=fps, loop=loop)

            if result is True:
                return f'{image_index} image(s) converted to GIF and uploaded as {gif_name} successfully'
            else:
                return f'Error while converting to GIF: {result}', 500
        else:
            return 'No images received', 400
    except Exception as e:
        return str(e), 500

def convert_images_to_gif(image_list, output_filename, fps=10, loop=0):
    try:
        if not image_list:
            raise ValueError("No images provided.")

        # Create a GIF from the list of images
        output_gif = io.BytesIO()
        image_list[0].save(output_gif, format="GIF", save_all=True, append_images=image_list[1:], loop=loop, duration=1000 // fps)

        # Set the full output file path including the directory
        output_path = os.path.join("static/user_data/gif", output_filename)
        output_path = output_path.replace("\\", "/")
        # Save or process the GIF to the specified directory
        output_gif.seek(0)
        with open(output_path, 'wb') as f:
            f.write(output_gif.read())
        append_line_to_text_file(output_filename)
        return True  # Return the full output file path
    except Exception as e:
        return str(e)
def append_line_to_text_file(text_to_append, file_path=r"static\user_data\Gif_list.txt"):
    
    with open(file_path, 'a') as file:
        file.write(text_to_append + '\n')
    return True  # Success



app.run(host='0.0.0.0', port=5088, debug=True)