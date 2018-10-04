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
   * Stablish ROS topics and params
   */
    constructor(props) {
	super();
	this.vm = props.vm

	// Connect to ROS.
	this.ros = this.vm.ros;

	this.goal_initial_interactive_pub = new ROSLIB.Topic({
            ros: this.ros,
            name: '/goal/initial_marker',
            messageType: 'std_msgs/String'
	});

	// Add ros params.
	this.fixed_frame_param = new ROSLIB.Param({
            ros: this.ros,
            name: '/fixed_frame'
	});

	this.link_group_param = new ROSLIB.Param({
            ros: this.ros,
            name: '/link_group/'
	});

    }

  /**
   * Setup all visualization elements when the page is loaded.
   */	
    componentDidMount() {
	var that = this;

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

	// Setup clients.
	this.fixed_frame_param.get(function(fixed_frame) {
            var tfClient = new ROSLIB.TFClient({
		ros : that.ros,
		fixedFrame : fixed_frame,
		angularThres : 0.01,
		transThres : 0.01,
		rate : 10.0
            });
            var imClient = new ROS3D.InteractiveMarkerClient({
		ros : that.ros,
		tfClient : tfClient,
		hidden : true,
		topic : '/goal/marker',
		camera : viewer.camera,
		rootObject : viewer.selectableObjects
            });

	    var imClient2 = new ROS3D.InteractiveMarkerClient({
		ros : that.ros,
		tfClient : tfClient,
		topic : '/goal/marker',
		camera : viewer.camera,
		path: '/wrist_roll_link',
		rootObject : viewer.selectableObjects
            });

            var urdfClient = new ROS3D.UrdfClient({
		ros : that.ros,
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
	    that.vm.handleSelectPose.call(that.vm,0);
	});

	this.link_group_param.get(function(link_group) {
	    var group_name;
	    for (group_name in link_group) {
		$('#group').append("<option value=" + group_name + ">" + group_name + "</option>");
	    }
	    $("select#group").bind('change', function() {
		var current_group = $("select#group option:selected").val();
		var msg = new ROSLIB.Message({
		    data: current_group
		});

		that.goal_initial_interactive_pub.publish(msg);});
	    // $.getScript("rwt_moveit/js/jquery-mobile/jquery.mobile-1.3.2.min.js");
	    // $.getScript("https://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.js");
	    

	    var current_group = $("select#group option:selected").val();
	    var msg = new ROSLIB.Message({
	    	data: current_group
	    });

	    that.goal_initial_interactive_pub.publish(msg);
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
