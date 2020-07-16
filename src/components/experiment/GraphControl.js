import React, { useContext } from "react";
import ExperimentContext from "../context/experiment/experimentContext";
import SelectionControl from "./SelectionControl";

const GraphControl = () => {
  const experimentContext = useContext(ExperimentContext);
  const {
    getExperimentGraph,
    experiment,
    enabledGraphSearch,
    experimentRunning,
    data,
    loadingJobMonitor,
    getExperimentPkl,
    setAutoUpdatePkl,
    startAutoUpdatePkl,
  } = experimentContext;

  const onSubmitGraph = (grouped = "none", layout = "standard") => (e) => {
    e.preventDefault();
    getExperimentGraph(experiment.expid, grouped, layout);
    //window.showGraphTab();
  };

  const onJobMonitor = (e) => {
    e.preventDefault();
    setAutoUpdatePkl(true);
  };

  const onNotJobMonitor = (e) => {
    e.preventDefault();
    setAutoUpdatePkl(false);
  };

  const onRequestUpdate = (e) => {
    e.preventDefault();
    getExperimentPkl(experiment.expid, experiment.pkl_timestamp);
  };

  return (
    <div className='card-header p-1'>
      <div className='row'>
        <div className='col-md-2'>
          {loadingJobMonitor && <div>Querying...</div>}
        </div>
        <div className='col-md-10'>
          <div className='row justify-content-end'>
            {experiment && data && (
              <div className='col-md-2'>
                <SelectionControl />
              </div>
            )}

            <div className='col-md-2'>
              <form onSubmit={onSubmitGraph()} className='form'>
                <input
                  type='submit'
                  value='Classic'
                  className='btn btn-info btn-block btn-sm'
                  disabled={!enabledGraphSearch}
                />
              </form>
            </div>
            <div className='col-md-1'>
              <form
                onSubmit={onSubmitGraph("none", "laplacian")}
                className='form'
              >
                <input
                  type='submit'
                  value='Laplacian'
                  className='btn btn-info btn-block btn-sm'
                  disabled={!enabledGraphSearch}
                />
              </form>
            </div>
            <div className='col-md-2'>
              <form onSubmit={onSubmitGraph("date-member")} className='form'>
                <input
                  type='submit'
                  value='Grouped by D-M'
                  className='btn btn-info btn-block btn-sm'
                  disabled={!enabledGraphSearch}
                />
              </form>
            </div>
            <div className='col-md-2'>
              <form onSubmit={onSubmitGraph("status")} className='form'>
                <input
                  type='submit'
                  value='Grouped by Status'
                  className='btn btn-info btn-block btn-sm'
                  disabled={!enabledGraphSearch}
                />
              </form>
            </div>
            {experiment && data && experimentRunning && !startAutoUpdatePkl && (
              <div className='col-md-1'>
                <form onSubmit={onRequestUpdate} className='form'>
                  <input
                    type='submit'
                    value='Refresh'
                    className='btn btn-success btn-block btn-sm'
                    disabled={!enabledGraphSearch}
                  />
                </form>
              </div>
            )}
            {experimentRunning && data && !startAutoUpdatePkl && (
              <div className='col-md-2'>
                <form onSubmit={onJobMonitor} className='form'>
                  <input
                    type='submit'
                    value='Start Job Monitor'
                    className='btn btn-success btn-block btn-sm'
                    disabled={!enabledGraphSearch}
                  />
                </form>
              </div>
            )}
            {experimentRunning && data && startAutoUpdatePkl && (
              <div className='col-md-2'>
                <form onSubmit={onNotJobMonitor} className='form'>
                  <input
                    type='submit'
                    value='Stop Job Monitor'
                    className='btn btn-danger btn-block btn-sm'
                    disabled={!enabledGraphSearch}
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphControl;
