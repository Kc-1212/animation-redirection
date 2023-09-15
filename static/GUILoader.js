import { GUI } from '/static/jsm/libs/lil-gui.module.min.js';
import { clearTimeouts, setTimeout } from './TimeoutManager.js';
import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";

// clear trajectory and info container
function resetGUI (gltfLoaderHelper){
    gltfLoaderHelper.setAllVertexColorsToWhite();
    let guiContainer = document.getElementById('trajectory-container');
    d3.select(guiContainer).select("svg").remove();
    clearTimeouts();
    guiContainer = document.getElementById('info-container');
    destroyGUI("info_gui",guiContainer)
}

// clear elements in info gui
function destroyGUI(uuid,guiContainer) {
    const guiElement = guiContainer.querySelector(`[id="${uuid}"]`);
    if (guiElement) {
      guiContainer.removeChild(guiElement);
    }
}

export class GUILoader {
    constructor (renderer, scene, camera){
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
    }
    
    setupGui() {
        effectController = {
            skeleton: false,
            toggle: true,
            body: true,
            newShading: 'flat'
        };

        const gui = new GUI();
        gui.add(effectController, 'skeleton').name('Display skeleton').onChange(showSkeleton);
        gui.add(effectController, 'body').name('Display body').onChange(showBody);
        gui.add(effectController, 'toggle').name('Rotate').onChange(toggleRotation);
        gui.add(effectController, 'newShading', ['wireframe', 'flat']).name('Shading').onChange(changeShading);
    }

    // display options
    jointSegmentOption(gltfLoaderHelper) {
        const guiContainer = document.getElementById( 'option-container')
        var gui = new GUI({ 
            container: guiContainer, 
            autoPlace: false, 
            title: "Display Options" 
        });

        gui.domElement.id = 'gui';
        var options = {
            showSegments: false,
            showJoints: false,
        };
        
        guiContainer.appendChild(gui.domElement);
        gui.domElement.id = "Joint/Segment Show/Hide";
        
        const segmentsController = gui.add(options, "showSegments").name("Show Body Segments");
        const jointsController = gui.add(options, "showJoints").name("Show Body Joints");

        segmentsController.onFinishChange(function (value) {
            resetGUI(gltfLoaderHelper);
            if (value) {      
                options.showJoints = false;
                jointsController.setValue(false);
                gltfLoaderHelper.setSegmentVisible(true);
                gltfLoaderHelper.setJointVisible(false);
            }
            else {
                options.showSegments = false;
                gltfLoaderHelper.setSegmentVisible(false);
            }
        });

        jointsController.onFinishChange(function (value) {
            resetGUI(gltfLoaderHelper);
            if (value) {
                options.showSegments = false;
                segmentsController.setValue(false);
                gltfLoaderHelper.setJointVisible(true);
                gltfLoaderHelper.setSegmentVisible(false); 
            }
            else {
                options.showJoints = false;
                gltfLoaderHelper.setJointVisible(false);
            }
        });
    }

    // display joint information
    showJointInfo(name, x, y, z) {
        //reset joint info container
        const guiContainer = document.getElementById('info-container');
        destroyGUI("info_gui",guiContainer)

        // generate a unique ID for the GUI
        const guiId = "info_gui"; 
        const gui = new GUI({ 
            container: guiContainer, 
            autoPlace: false, 
            title: "Joint Info"
        });
       
        // set the ID of the GUI element to the generated UUID
        gui.domElement.id = guiId; 

        var info = {
            jointName: name,
            xPos: x,
            yPos: y,
            zPos: z
        }

        gui.add(info, "jointName").name('Joint Name');
        gui.add(info, "xPos").name('X Position');
        gui.add(info, "yPos").name('Y Position');
        gui.add(info, "zPos").name('Z Position');

        guiContainer.appendChild(gui.domElement);
    }

    // display segment information
    showSegmentInfo(name) {
       //reset joint info container
       const guiContainer = document.getElementById('info-container');
       destroyGUI("info_gui",guiContainer)

       // generate a unique ID for the GUI
       const guiId = "info_gui"; 
        const gui = new GUI({ 
            container: guiContainer, 
            autoPlace: false, 
            title: "Body Segment Info"
        });

         // set the ID of the GUI element to the generated UUID
        gui.domElement.id = guiId;

        var info = {
            segmentName: name,
        }

        gui.add(info, "segmentName").name('Segment Name');
        guiContainer.appendChild(gui.domElement);
    }

    // display joint/ segment trajectory
    showTrajectory(name, jointCoordinates) {
        const guiContainer = document.getElementById('trajectory-container');
        
        // Remove existing SVG element
        d3.select(guiContainer).select("svg").remove();
    
        // create an SVG element inside the guiContainer
        const svg = d3.select(guiContainer).append("svg")
            .attr("width", 400)
            .attr("height", 300);
    
        // define the data for the graph (last 10 coordinates)
        const data = jointCoordinates.slice(-10).map((y, i) => ({ index: i, y }));

    
        // define the scales for the axes
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.index))
            .range([0, 400])
            .padding(0.1);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([400, 0]); 
    
        svg.append("text")
            .attr("x", 200)
            .attr("y", 15)
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-family", "Lucida Console")
            .style("font-size", "14px")
            .text("Trajectory");

        // create x and y axis lines
        svg.append("line")
            .attr("x1", 15)
            .attr("y1", 200)
            .attr("x2", 400)
            .attr("y2", 200)
            .attr("stroke", "white");

        svg.append("line")
            .attr("x1", 15)
            .attr("y1", 0)
            .attr("x2", 15)
            .attr("y2", 200)
            .attr("stroke", "white");

        // add x and y axis labels
        svg.append("text")
            .attr("x", 200)
            .attr("y", 220)
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font-family", "Lucida Console")
            .style("font-size", "12px")
            .text(name);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -100)
            .attr("y", 10)
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font-family", "Lucida Console")
            .style("font-size", "12px")
            .text("Euclidean Distance");
    
        // add the y line to the SVG element
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x(d => xScale(d.index) + xScale.bandwidth() / 2)
            .y(d => yScale(d.y) + 30)
            );

        svg.append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
              .attr("cx", function(d) { return xScale(d.index) + xScale.bandwidth() / 2 } )
              .attr("cy", function(d) { return yScale(d.y) + 30 } )
              .attr("r", 5)
              .attr("fill", function(d) { 
                  if (d.index === data.length - 1) {
                      return "#a0404e";
                  } else {
                      return "#69b3a2";
                  }
              });
    }
}