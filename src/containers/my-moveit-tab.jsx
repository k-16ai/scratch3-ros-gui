import React from 'react';
import VM from 'scratch-vm';

import * as ROS3D from 'ros3d'
import ROSLIB from 'roslib'

// import * from '../include/jquery-1.9.1.min.js'
// import * from '../include/three.js'
// import * from '../include/ColladaLoader.js'
// import * from '../include/STLLoader.js'
// import * from '../include/eventemitter2.min.js'
// import * from '../include/roslib.js'
// import * from '../include/ros3d.js'
// import * from '../include/jsColladaLoader.js'

class MyTab extends React.Component {
    render() {
	return (
		<div id="main-content">
		  <div id="urdf"></div>
		  <div id="control-content">
		    <select id="group" name="group">
		    </select>
		  </div>
		</div>
	);
    }

    /**
     * Setup all visualization elements when the page is loaded.
     */
    componentDidMount() {
	// Connect to ROS.
	var ros = new ROSLIB.Ros({
            url : 'ws://localhost:9090'
	});

	goal_initial_interactive_pub = new ROSLIB.Topic({
            ros: ros,
            name: '/goal/initial_marker',
            messageType: 'std_msgs/String'
	});

	// Create the main viewer.
	var width = parseInt($("#main-content").css("width"));
	var height = Math.max(
            $(document).height(),
            $(window).height(),
            /* For opera: */
            document.documentElement.clientHeight
	);

	var viewer = new ROS3D.Viewer({
            divID : 'urdf',
            width : width * 0.8,
            height : height * 0.8,
            antialias : true
	});

	// Add grid.
	viewer.addObject(new ROS3D.Grid());

	// Add ros params.
	fixed_frame_param = new ROSLIB.Param({
            ros: ros,
            name: '/fixed_frame'
	});

	link_group_param = new ROSLIB.Param({
            ros: ros,
            name: '/link_group/'
	});

	// Setup clients.
	fixed_frame_param.get(function(fixed_frame) {
            var tfClient = new ROSLIB.TFClient({
		ros : ros,
		fixedFrame : fixed_frame,
		angularThres : 0.01,
		transThres : 0.01,
		rate : 10.0
            });
            var imClient = new ROS3D.InteractiveMarkerClient({
		ros : ros,
		tfClient : tfClient,
		hidden : true,
		topic : '/goal/marker',
		camera : viewer.camera,
		rootObject : viewer.selectableObjects
            });

            var urdfClient = new ROS3D.UrdfClient({
		ros : ros,
		tfPrefix : 'goal',
		color : 0xff3000,
		tfClient : tfClient,
		hidden : true,
		param : 'robot_description',
		path : 'https://raw.githubusercontent.com/fetchrobotics/fetch_ros/indigo-devel/',
		rootObject : viewer.scene
            });

	});

	link_group_param.get(function(link_group) {
	    for (group_name in link_group) {
		$('#group').append("<option value=" + group_name + ">" + group_name + "</option>");
	    }
	    $("select#group").bind('change', groupCallback);
	    $.getScript("rwt_moveit/js/jquery-mobile/jquery.mobile-1.3.2.min.js");

	    groupCallback();
	});
    }
}

function groupCallback() {
    var current_group = $("select#group option:selected").val();
    var msg = new ROSLIB.Message({
        data: current_group
    });

    goal_initial_interactive_pub.publish(msg);
}

export default MyTab;
