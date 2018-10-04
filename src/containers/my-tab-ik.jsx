import React from 'react';
import VM from 'scratch-vm';
import * as ROSLIB from 'roslib'
import bindAll from 'lodash.bindall';

//import MoveIt from './rwt-moveit.jsx';
import MoveIt from './rwt-moveit-ik.jsx';
import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import poseIcon from '../components/asset-panel/icon--pose.svg';
import addSoundFromLibraryIcon from '../components/asset-panel/icon--add-sound-lib.svg';

class MyTabIK extends React.Component {
  constructor(props) {
      super(props);
      bindAll(this, [
          'handleSelectPose',
	  'handleDeletePose',
          'handleNewPose',
	  'update'
      ]);
      this.state = {selectedPoseIndex: 0};
      this.ros = new ROSLIB.Ros({ url : 'ws://localhost:9090' });
      var initPose = 
      	  [{text: 'Init Pose',
      	    name: ['r_wheel_joint', 'l_wheel_joint',
      		   'torso_lift_joint',
      		   'head_pan_joint', 'head_tilt_joint',
      		   'shoulder_pan_joint', 'shoulder_lift_joint', 
      		   'upperarm_roll_joint', 'elbow_flex_joint', 'forearm_roll_joint',
      		   'wrist_flex_joint', 'wrist_roll_joint',
      		   'r_gripper_finger_joint', 'l_gripper_finger_joint',
      		   'bellows_joint'],
      	    position: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}];

      const sprite = props.vm.editingTarget.sprite;
      if(!sprite.posesIK) sprite.posesIK = initPose;

      var topic = new ROSLIB.Topic({
	  ros: this.ros,
	  name: '/update_goal_joint_position',
	  messageType: 'std_msgs/Float64MultiArray',
	  queue_slize: 1
      });
      topic.subscribe(this.update);
  }

  update(msg) {
      if(msg.layout.data_offset==1) return; // Viewer update
      var sprite = this.props.vm.editingTarget.sprite;
      var pose = sprite.posesIK[this.state.selectedPoseIndex];
      var msgName = msg.layout.dim.map(obj => obj.label);
      var msgPosition = msg.data;

      for (var i=0; i<msgName.length; i++) {
	  var index = pose.name.findIndex(val => val === msgName[i]);
	  pose.position[index] = msgPosition[i]; }
  }

  handleSelectPose(index) {
      this.setState({selectedPoseIndex: index});

      var sprite = this.props.vm.editingTarget.sprite;
      var pose = sprite.posesIK[index];
      var dim = pose.name.map(function(name) { return {label: name}; });
      var msg = {layout: {dim: dim, data_offset: 1}, data: pose.position};

      var topic = new ROSLIB.Topic({
	  ros: this.ros,
	  name: '/update_goal_joint_position',
	  messageType: 'std_msgs/Float64MultiArray'});
      topic.publish(msg);

      var joint_state = {header: {frame_id: '/base_link'},
			 position: pose.position,
			 name: pose.name};

      var markerUpdate = new ROSLIB.Topic({
	  ros: this.ros,
	  name: '/goal/marker/tunneled/update',
	  messageType: 'visualization_msgs/InteractiveMarkerUpdate',
	  latch: true});

      var service = new ROSLIB.Service({
	  ros: this.ros,
	  name: '/compute_fk',
	  serviceType : 'moveit_msgs/GetPositionFK'});

      var request =
	  {fk_link_names: ['wrist_roll_link'],
	   robot_state: {joint_state: joint_state}};

      service.callService(request, function(response) {
	  var markerPose = {header: response.pose_stamped[0].header,
			    pose: response.pose_stamped[0].pose,
			    name: 'goal'};
	  markerUpdate.publish({poses: [markerPose]}); });
  }

  handleDeletePose(index) {
      var sprite = this.props.vm.editingTarget.sprite;
      sprite.posesIK = sprite.posesIK
	  .slice(0,index)
	  .concat(sprite.posesIK.slice(index + 1));

      if (index >= this.state.selectedPoseIndex) {
          this.handleSelectPose(Math.max(0, index - 1));
      }

      this.props.vm.runtime.requestTargetsUpdate(this.props.vm);
  }


  handleNewPose() {
      var poseName = prompt('Input pose name');
      if (poseName===null) return;

      var that = this;
      var sprite = this.props.vm.editingTarget.sprite;
      var topic = new ROSLIB.Topic({
	  ros: this.ros,
	  name: '/goal_joint_states',
	  messageType: 'sensor_msgs/JointState',
	  queue_slize: 1});

      topic.subscribe(msg => { topic.unsubscribe();
			       sprite.posesIK = sprite.posesIK.concat(
				   {text: poseName,
				    name: msg.name,
				    position: msg.position});
			       that.setState({selectedPoseIndex: sprite.posesIK.length - 1});
			     });
  }

  render() {
      var sprite = this.props.vm.editingTarget.sprite;
      var poseData = sprite.posesIK.map( function(pose) {
	  return {name: pose.text, url: poseIcon}; });

      return (
<AssetPanel
    buttons={[
	{
	    title: 'Add Pose',
	    img: addSoundFromLibraryIcon,
	    onClick: this.handleNewPose
	}]}
   dragType='COSTUME'
   items={poseData}
   selectedItemIndex={this.state.selectedPoseIndex}
   onDeleteClick={this.handleDeletePose}
   onItemClick={this.handleSelectPose}>
   <MoveIt vm={this}/>
</AssetPanel>
      );
  }

}

export default MyTabIK;
