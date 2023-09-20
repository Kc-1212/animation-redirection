import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect, send_file
from werkzeug.exceptions import abort

app = Flask(__name__)

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
@app.route("/download")
def download():
    try:
        return send_file("static/assets/smpl.glb", as_attachment=True, download_name="model.obj")
    except Exception as e:
        return str(e)

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

app.run(host='0.0.0.0', port=5088, debug=True)