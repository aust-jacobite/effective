import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import generateId from '../../../../utils/generateId';
import { showAssignee, isRootTaskInPursuance } from '../../../../utils/tasks';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import TiPlus from 'react-icons/lib/ti/plus';
import TiMinus from 'react-icons/lib/ti/minus';
import TiFlowChildren from 'react-icons/lib/ti/flow-children';
import FaCommentsO from 'react-icons/lib/fa/comments-o';
import FaCheck from 'react-icons/lib/fa/check';
import TaskForm from '../../TaskManager/TaskForm/TaskForm';
import TaskStatus from '../../TaskStatus/TaskStatus';
import TaskAssigner from './TaskAssigner/TaskAssigner';
import TaskDueDate from '../../TaskDueDate/TaskDueDate';
import { filterSuggestion } from '../../../../utils/suggestions';
import './Task.css';
import {
  addTaskFormToHierarchy,
  removeTaskFormFromHierarchy,
  startSuggestions,
  rpShowTaskDetailsOrCollapse,
  patchTask
} from '../../../../actions';

// task list uses the default vertical/wide spread confetti
const confettiConfig = {
  angle: 80,
  spread: 148,
  startVelocity: 77,
  elementCount: 167,
  decay: 0.84
};

class RawTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChildren: true
    };
  }

  toggleChildren = () => {
    this.setState({
      ...this.state,
      showChildren: !this.state.showChildren
    });
  }

  toggleNewForm = () => {
    const {
      taskData,
      addTaskFormToHierarchy,
      removeTaskFormFromHierarchy
    } = this.props;

    if (!taskData.subtaskform_id) {
      addTaskFormToHierarchy(taskData.gid, generateId('task'));
    } else {
      removeTaskFormFromHierarchy(taskData.gid, taskData.subtaskform_id);
    }
  }

  redirectToDiscuss = () => {
    const { history, taskData, match: { params: { pursuanceId } } } = this.props;
    history.push({
      pathname: `/pursuance/${pursuanceId}/discuss/task/${taskData.gid}`
    });
  }

  styleUl = () => {
    if (this.state.showChildren) {
      return { display: 'block' };
    } else {
      return { display: 'none' };
    }
  }

  mapSubTasks = (task) => {
    const { pursuances, autoComplete, taskMap, taskForm, isInTaskList } = this.props;
    if (isInTaskList) {
      return null;
    }
    return task.subtask_gids.map((gid) => {
      return (
          <Task
            key={gid}
            taskData={taskMap[gid]}
            taskMap={taskMap}
            pursuances={pursuances}
            autoComplete={autoComplete}
            taskForm={taskForm}
          />
      )
    });
  }

  toggleDone = () => {
    const { taskData, patchTask } = this.props;
    if (taskData.status === 'Done') {
      patchTask({ gid: taskData.gid, status: 'New' });
    } else {
      patchTask({ gid: taskData.gid, status: 'Done' });
    }
  }

  getTaskIcon = (task, showChildren) => {
    const { isInTaskList } = this.props;

    if (isInTaskList) {
      return (
        <div className={"toggle-icon-ctn-intasklist status-" + task.status} onClick={this.toggleDone}>
          <FaCheck className={"check-toggle-" + task.status} size={22} />
        </div>
      );
    }

    if (task.subtask_gids.length < 1) {
      return (
        <div className="toggle-icon-ctn-disable" />
      );
    } else if (showChildren) {
      return (
        <div className="toggle-icon-ctn" onClick={this.toggleChildren}>
          <TiMinus className="minus-icon" />
        </div>
      );
    } else {
      return (
        <div className="toggle-icon-ctn" onClick={this.toggleChildren}>
          <TiPlus className="plus-icon" />
        </div>
      );
    }
  }

  onFocus = (e) => {
    const { users, pursuances, startSuggestions, currentPursuanceId, taskData } = this.props;
    const suggestions = Object.assign({}, pursuances, users);
    delete suggestions[currentPursuanceId];
    startSuggestions(e.target.value, filterSuggestion, suggestions, taskData.gid);
  }

  getStatusClassName = (task) => {
    const status = task.status || "New";
    return ("task-title-status-" + status);
  }

  showTitle = (task) => {
    const { currentPursuanceId, isInTaskList } = this.props;
    const statusClassName = this.getStatusClassName(task);

    if (isInTaskList || !isRootTaskInPursuance(task, currentPursuanceId)) {
      return (
        <div className={statusClassName}>{task.title}</div>
      );
    }
    // Bold top-level tasks
    return (
      <div className={statusClassName}>
        <strong>{task.title}</strong>
      </div>
    );
  }

  getTooltip = (icon) => {
    if (icon === 'hands-down') {
      return (
        <Tooltip id="tooltip-hands-down">
          <strong>Create Subtask</strong>
        </Tooltip>
      );
    } else if (icon === 'chat') {
      return (
        <Tooltip id="tooltip-chat">
          <strong>Discuss Task</strong>
        </Tooltip>
      );
    }
  }

  selectTaskInHierarchy = () => {
    const { taskData, rpShowTaskDetailsOrCollapse } = this.props;
    rpShowTaskDetailsOrCollapse({taskGid: taskData.gid});
  }

  render() {
    const { pursuances, taskData, currentPursuanceId, rightPanel, isInTaskList } = this.props;
    const { showChildren } = this.state;
    const task = taskData;
    if (!task) {
      return null;
    }
    const { placeholder, assignedTo } = showAssignee(task, currentPursuanceId, pursuances);
    const highlightTask = rightPanel.show && rightPanel.taskGid === taskData.gid;

    return (
      <li className={"li-task-ctn " + (isInTaskList ? 'in-task-list' : '')}>
        <div className={highlightTask ? 'task-ctn highlight' : 'task-ctn'}>
          {!isInTaskList && (
            <div className="toggle-ctn">
              {this.getTaskIcon(task, showChildren)}
            </div>
          )}
          {isInTaskList && (
            <div className="task-icon-in-task-list">
              {this.getTaskIcon(task, showChildren)}
            </div>
          )}
          <div className="task-row-ctn">
            <div className="task-title" onClick={this.selectTaskInHierarchy}>
              {this.showTitle(task)}
            </div>
            <div className="task-title-buffer" onClick={this.selectTaskInHierarchy}>
            </div>
            <div className={"task-icons-ctn " + (isInTaskList ? 'in-task-list-narrow' : '')}>
              {!isInTaskList && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={this.getTooltip('hands-down')}
                >
                  <div id={'create-subtask-' + task.gid} className="icon-ctn create-subtask" onClick={this.toggleNewForm}>
                    <TiFlowChildren size={20} />
                  </div>
                </OverlayTrigger>
              )}
              <OverlayTrigger
                placement="bottom"
                overlay={this.getTooltip('chat')}
              >
                <div id={'discuss-task-' + task.gid} className="icon-ctn discuss-task hide-small" onClick={this.redirectToDiscuss}>
                  <FaCommentsO size={20} />
                </div>
              </OverlayTrigger>
            </div>
            {!isInTaskList && (
              <TaskStatus
                gid={task.gid}
                status={task.status}
                patchTask={this.props.patchTask}
                showCelebration={task.celebration === 'show' && !rightPanel.show}
                confettiConfig={confettiConfig}
              />
            )}
            <div className="task-assigned-to hide-small">
              <TaskAssigner
                taskGid={task.gid}
                placeholder={placeholder}
                assignedTo={assignedTo}
              />
            </div>
            <TaskDueDate
              id={task.gid}
              taskData={task}
              autoFocus={true}
              patchTask={this.props.patchTask}
             />
          </div>
        </div>
        {
          task.subtask_gids && task.subtask_gids.length > 0 &&
            <ul className="ul-ctn" style={this.styleUl()}>
              {this.mapSubTasks(task)}
            </ul>
        }
        {task.subtaskform_id && <TaskForm
                                  parentGid={task.gid}
                                  id={task.subtaskform_id} />}
      </li>
    );
  }
}

const Task = withRouter(connect(
  ({ pursuances, user, users, currentPursuanceId, autoComplete, rightPanel }) =>
   ({ pursuances, user, users, currentPursuanceId, autoComplete, rightPanel }), {
  addTaskFormToHierarchy,
  removeTaskFormFromHierarchy,
  startSuggestions,
  rpShowTaskDetailsOrCollapse,
  patchTask
})(RawTask));

// Why RawTask _and_ Task? Because Task.mapSubTasks() recursively
// renders Task components which weren't wrapped in a Redux connect()
// call (until calling the original component 'RawTask' and the
// wrapped component 'Task'), and thus `this.props` wasn't being
// populated by Redux within mapSubTasks(). More info:
// https://stackoverflow.com/a/37081592/197160
export default Task;
