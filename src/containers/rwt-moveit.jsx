import React from 'react';
import VM from 'scratch-vm';

import 'jquery/jquery';
import * as ROS3D from 'ros3d';
import ROSLIB from 'roslib';

class MoveIt extends React.Component {
  render() {
      return (
      // <iframe src="localhost:8000/rwt_moveit"></iframe>
      <div id="main-content">
        <div id="urdf"></div>
        <div id="control-content">
	  <body>
            <select id="group" name="group"/>
          </body>
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

	var goal_initial_interactive_pub = new ROSLIB.Topic({
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
            width : width,
            height : height* 0.6,
            antialias : true
	});

	// Add grid.
	viewer.addObject(new ROS3D.Grid());

	// Add ros params.
	var fixed_frame_param = new ROSLIB.Param({
            ros: ros,
            name: '/fixed_frame'
	});

	var link_group_param = new ROSLIB.Param({
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
		rootObject : viewer.scene,
		path : 'https://raw.githubusercontent.com/fetchrobotics/fetch_ros/indigo-devel/'
  //NEXTAGE
  //'https://raw.githubusercontent.com/tork-a/rtmros_nextage/indigo-devel/'
  //HIRO
  //'https://raw.githubusercontent.com/start-jsk/rtmros_hironx/indigo-devel/'

            });

	});

	link_group_param.get(function(link_group) {
	    var group_name;
	    for (group_name in link_group) {
		$('#group').append("<option value=" + group_name + ">" + group_name + "</option>");
	    }
	    $("select#group").bind('change', function() {
		var current_group = $("select#group option:selected").val();
		var msg = new ROSLIB.Message({
		    data: current_group
		});

		goal_initial_interactive_pub.publish(msg); });
	    // $.getScript("rwt_moveit/js/jquery-mobile/jquery.mobile-1.3.2.min.js");
	    // $.getScript("https://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.js");
	    

	    var current_group = $("select#group option:selected").val();
	    var msg = new ROSLIB.Message({
	    	data: current_group
	    });

	    goal_initial_interactive_pub.publish(msg);
	});
    }

    // groupCallback() {
    // 	var current_group = $("select#group option:selected").val();
    // 	var msg = new ROSLIB.Message({
    //         data: current_group
    // 	});

    // 	this.goal_initial_interactive_pub.publish(msg);
    // }
}


//ReactDOM.render(<Marker />, document.getElementById('root'));

export default MoveIt;
