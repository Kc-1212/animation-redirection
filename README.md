# Ai3D Flask Threejs Examples

This project merges flask with threejs with three examples (i.e. BVH loader, Skinning Blending Additive, Skinning Blending Skeleton)


To setup a python virtual environment:<br/>
`python3 -m venv ai3dexample`<br/>
`virtualenv ai3dexample`<br/>
`source ai3dexample/bin/activate`<br/>
`pip install Flask`<br/>

To run flask application:<br/>
(ai3dexample)$ `flask run`

Access from your browser on at this link: [`http://localhost:5000`](http://localhost:5000)

Some notes and resources:
- The purpose of static folder is to serve static files such as images, CSS files, and JavaScript files.
- The templates folder contains static data as well as placeholders for dynamic data. A [template](https://flask.palletsprojects.com/en/2.0.x/tutorial/templates/) is rendered with specific data to produce a final document. 
- [Threejs resource](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models)


# Git Guide
CREATE NEW BRANCH
1. pull latest main branch: git pull origin master:master
2. create new branch: git switch --create feature/[your-name]/[branch-name]

COMMIT CHANGES
1. see changes made: git status
2. add changes to branch: git add [file]
3. commit changes: git commit -m "[commit-message]"
4. push changes: git push --set-upstream origin HEAD

CREATE PULL REQUEST
1. go to bit bucket
2. pull requests -> create pull request
3. select the branch

OTHERS
1. temporary stash changes: git stash 
2. go to another branch: git checkout [branch-name]
3. Fetching remote main: git fetch origin main
4. Pulling remote main: git pull origin main
5. cherry pick commit: git cherry-pick [commit-id]
