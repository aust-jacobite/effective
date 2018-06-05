import React, { Component } from 'react';

import './TaskTitle.css';

class TaskTitle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newTitle: '',
      showInput: false
    };
  }

  componentWillReceiveProps = (newProps) => {
    // handle case when selected task will change.
    if (newProps.title !== this.props.title) {
      this.setState({showInput: false});
    }
  }

  validTitle = (value) => {
    return value !== ''
  }

  toggleInput = () => {
    const { showInput } = this.state;
    this.setState({showInput: !showInput});
  }

  onEnter = (value) => {
    const { id, patchTask } = this.props;
    // const { newTitle } = this.state;
    patchTask({
      gid: id,
      title: value
    })
  }

  onChange = (e) => {
    const { value } = e.target;
    const { key } = e;
    if (key === 'Enter') {
      this.onEnter(value);
      this.toggleInput();
    }
  }

  render() {
    const { title } = this.props;
    const { showInput } = this.state;

    return (
      <div className="discuss-task-title-ctn">
        {showInput && (
          <input
            autoFocus
            type="text"
            className="discuss-task-title-update"
            name={'title'}
            defaultValue={title}
            onKeyPress={this.onChange}
          />
        )}
        {!showInput && (
          <span className="discuss-task-title" onClick={this.toggleInput}>{title}</span>
        )}
      </div>
    )
  }
}

export default TaskTitle;
