import './App.css';
import {uuid} from './uuid.js';
import {useState, useEffect} from 'react';
import {helpers} from './helpers';
import {client} from './client';

const TimerForm = (props) => {
    const [title, setTitle] = useState(props.title || "");
    const [project, setProject] = useState(props.project || "");

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleProjectChange = (e) => {
        setProject(e.target.value);
    };

    const handleSubmit = () => {
        props.onFormSubmit({
          id: props.id,
          title: title,
          project: project,
        });
    };

    const submitText = props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input
                type='text'
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div className='field'>
              <label>Project</label>
              <input
                type='text'
                value={project}
                onChange={handleProjectChange}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button'
                  onClick={handleSubmit}
              >
                {submitText}
              </button>
              <button className='ui basic red button'
                  onClick={props.onFormClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

const TimerActionButton = (props) => {
    if (props.timerIsRunning) {
      return (
        <div
          className='ui bottom attached red basic button'
          onClick={props.onStopClick}
        >
          Stop
        </div>
      );
    } else {
      return (
        <div
          className='ui bottom attached green basic button'
          onClick={props.onStartClick}
        >
          Start
        </div>
      );
    }
};

const Timer = (props) => {
    const [, forceUpdate] = useState({});
    const [updateInterval, setUpdateInterval] = useState(null);

    const timerEffect = () => {
        // use a variable so the closure will find it for cleanup
        let updateIntervalInternal = null;
        if (!!props.runningSince) {
            console.log(`starting updateInterval=${updateInterval}`);

            if (!updateInterval) {
                updateIntervalInternal = startUpdateInterval();
                setUpdateInterval(updateIntervalInternal);
                console.log(`started updateInterval=${updateIntervalInternal}`);
            }
        }

        return () => {
            // use the closure variable updateIntervalInternal
            console.log(`cleanup updateInterval=${updateIntervalInternal}`);
            if (updateIntervalInternal) {
                clearInterval(updateIntervalInternal);
                setUpdateInterval(null);
            }
        };
    }

    useEffect(() => {
        console.log("Timer useEffect, []");
        return timerEffect();
    }, []);

    useEffect(() => {
        console.log("Timer useEffect [props.runningSince]");
        return timerEffect();
    }, [props, props.runningSince]);

    const startUpdateInterval = () => {
        return setInterval(() => {
            //console.log("forceUpdate");
            forceUpdate({});
        }, 100);
    }

    const handleStartClick = () => {
        props.onStartClick(props.id);
        if (updateInterval) {
            clearTimeout(updateInterval);
            setUpdateInterval(null);
        }

        console.log("starting");
        const interval = startUpdateInterval();
        setUpdateInterval(interval);
        console.log(`started updateInterval=${interval}`);
    };

    const handleStopClick = () => {
        props.onStopClick(props.id);
        if (updateInterval) {
            console.log(`stopping updateInterval=${updateInterval}`);
            clearInterval(updateInterval);
            setUpdateInterval(null);
        }
    };

    const handleTrashClick = () => {
        props.onTrashClick(props.id);
    };

    const elapsedString = helpers.renderElapsedString(
      props.elapsed, props.runningSince
    );

    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {props.title}
          </div>
          <div className='meta'>
            {props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon'
                onClick={props.onEditClick}
            >
              <i className='edit icon' />
            </span>
            <span className='right floated trash icon'
                onClick={handleTrashClick}
            >
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerActionButton
          timerIsRunning={!!props.runningSince}
          onStartClick={handleStartClick}
          onStopClick={handleStopClick}
        />
      </div>
    );
};

const EditableTimer = (props) => {
    const [editFormOpen, setEditFormOpen] = useState(false);

    const handleEditClick = () => {
        openForm();
    };

    const handleFormClose = () => {
        closeForm();
    };

    const handleSubmit = (timer) => {
        props.onFormSubmit(timer);
        closeForm();
    };

    const closeForm = () => {
        setEditFormOpen(false);
    };

    const openForm = () => {
        setEditFormOpen(true);
    };

    if (editFormOpen) {
      return (
        <TimerForm
          id={props.id}
          title={props.title}
          project={props.project}
          onFormSubmit={handleSubmit}
          onFormClose={handleFormClose}
        />
      );
    } else {
      return (
        <Timer
          id={props.id}
          title={props.title}
          project={props.project}
          elapsed={props.elapsed}
          runningSince={props.runningSince}
          onEditClick={handleEditClick}
          onTrashClick={props.onTrashClick}
          onStartClick={props.onStartClick}
          onStopClick={props.onStopClick}
        />
      );
    }
};

const EditableTimerList = (props) => {
    const timers = props.timers.map((timer) => (
          <EditableTimer
            key={timer.id}
            id={timer.id}
            title={timer.title}
            project={timer.project}
            elapsed={timer.elapsed}
            runningSince={timer.runningSince}
            onFormSubmit={props.onFormSubmit}
            onTrashClick={props.onTrashClick}
             onStartClick={props.onStartClick}
             onStopClick={props.onStopClick}
         />
    ));

    return (
      <div id='timers'>
        {timers}
      </div>
    );
};

const ToggleableTimerForm = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFormOpen = () => {
        setIsOpen(true);
     };

    const handleFormClose = () => {
        setIsOpen(false);
    };

    const handleFormSubmit = (timer) => {
        props.onFormSubmit(timer);
        setIsOpen(false);
    };

    if (isOpen) {
          return (
            <TimerForm
                onFormSubmit={handleFormSubmit}
                onFormClose={handleFormClose}
            />
            );
    } else {
        return (
        <div className='ui basic content center aligned segment'>
          <button
            className='ui basic button icon'
            onClick={handleFormOpen}
          >
          <i className='plus icon' />
          </button>
        </div>
       );
    }
};

const TimersDashboard = (props) => {
    const [timers, setTimers] = useState([]);
    const loadTimersFromServer = () => {
        client.getTimers((serverTimers) => (
            setTimers(serverTimers)
        ));
    };

    useEffect(() => {
        let loadInterval = null;
        loadTimersFromServer();
        loadInterval = setInterval(loadTimersFromServer, 5000);

        return () => {
            clearInterval(loadInterval);
        }
    }, []);

    const createTimer = (timer) => {
        const t = helpers.newTimer(timer);
        setTimers(timers.concat(t));
        client.createTimer(t);
    };

      const handleCreateFormSubmit = (timer) => {
        createTimer(timer);
    };

    const updateTimer = (attrs) => {
        setTimers(timers.map((timer) => {
            if (timer.id === attrs.id) {
                console.log(`timerid = ${timer.id}`);
                return Object.assign({}, timer, {
                    title: attrs.title,
                    project: attrs.project
                });
            } else {
                return timer;
            }
        }));

        client.updateTimer(attrs);
    };

    const deleteTimer = (timerId) => {
        setTimers(timers.filter(t => t.id !== timerId));
        client.deleteTimer(
          { id: timerId }
        );
    };

    const startTimer = (timerId) => {
        const now = Date.now();
        setTimers(timers.map((timer) => {
            if (timer.id === timerId) {
                return Object.assign({}, timer, {
                    runningSince: now
                });
            } else {
                return timer;
            }
        }));

        client.startTimer(
          { id: timerId, start: now }
        );
    };

    const stopTimer = (timerId) => {
        const now = Date.now();
        setTimers(timers.map((timer) => {
            if (timer.id === timerId) {
                const lastElapsed = now - timer.runningSince;
                return Object.assign({}, timer, {
                    elapsed: timer.elapsed + lastElapsed,
                    runningSince: null
                });
            } else {
                return timer;
            }
        }));

        client.stopTimer(
          { id: timerId, stop: now }
        );

    };

    const handleStartClick = (timerId) => {
        startTimer(timerId);
    };

    const handleStopClick = (timerId) => {
        stopTimer(timerId);
    };

    const handleEditFormSubmit = (attrs) => {
        updateTimer(attrs);
    };

    const handleTrashClick = (timerId) => {
        deleteTimer(timerId);
    };

    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={timers}
            onFormSubmit={handleEditFormSubmit}
            onTrashClick={handleTrashClick}
            onStartClick={handleStartClick}
            onStopClick={handleStopClick}
          />
          <ToggleableTimerForm
              onFormSubmit={handleCreateFormSubmit}
          />
        </div>
      </div>
    );
};

function App() {
  return (
    <div className="App" >
        <div id="main" className="main ui">
          <h1 className="ui dividing centered header">Timers</h1>
            <TimersDashboard />
        </div>
    </div>
  );
}

export default App;
