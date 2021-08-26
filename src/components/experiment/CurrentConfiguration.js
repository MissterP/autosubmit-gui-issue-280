import React, {  useContext } from 'react';
import ExperimentContext from '../context/experiment/experimentContext';
import { generateConfigFileHtml } from '../context/utils';

const CurrentConfiguration = () => {
  const experimentContext = useContext(ExperimentContext);
  const {         
    currentConfiguration, configDifferences } = experimentContext;
  if (currentConfiguration) {
    if (currentConfiguration.error === true) {
      return (
        <div className="row">
          <div className="col">            
            <strong>{currentConfiguration.errorMessage}</strong>            
          </div>
        </div>
      )
    } else {
      /*  No errors detected. Proceed to validate data 
          and identify current configuration. 
      */
      // console.log(currentConfiguration);
      const messageAreEqual = currentConfiguration.areEqual === false ? "The current run configuration in the historical database is different than the current configuration in the file system." : null;
      const currentRunConfiguration = currentConfiguration.configurationCurrentRun;
      const currentFileSystemConfiguration = currentConfiguration.configurationFileSystem;
      const messageNoInformation = <div className="row mx-2"><div className="col">Not Available or Autosubmit API couldn't access the necessary files.</div></div>
      const alertDifferenceSpan = <span
      className='badge badge-warning'
      data-toggle='tooltip'
      data-placement='bottom'
      title='Difference detected.'
      >
      !
      </span>
      // console.log(currentDifferences);
      // const currentValidConfiguration = currentConfiguration.areEqual === true ?
      //   currentConfiguration.configurationCurrentRun.contains_nones === false ?
      //     currentConfiguration.configurationCurrentRun : 
      //     currentConfiguration.configurationFileSystem 
      //     :
      //   currentConfiguration.configurationFileSystem.contains_nones === false ?
      //     currentConfiguration.configurationFileSystem :
      //     currentConfiguration.configurationCurrentRun;
      
      // const sourceName = currentConfiguration.areEqual === true ?
      //   currentConfiguration.configurationCurrentRun.contains_nones === false ?
      //     "Historical Database" : 
      //     "File System"
      //     :
      //   currentConfiguration.configurationFileSystem.contains_nones === false ?
      //     "File System" :
      //     "Historical Database";
      // console.log(currentValidConfiguration);
      // console.log(sourceName);
      // console.log(configDifferences)
      return (
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-md-12">
                {currentConfiguration.warning === true && <p>{currentConfiguration.warningMessage}</p>}          
                {messageAreEqual && (<p className="text-center"><span className="text-muted">{messageAreEqual}</span></p>)}
              </div>            
            </div>
            <div className="row">          
              <div className="col">                           
                <ul className="nav nav-pills ml-4 mb-2" id="hconf-pills-tab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <a 
                      href="#hconf-pills-autosubmit" 
                      className="nav-link active"
                      data-toggle="pill"
                      role="tab"
                      id="hconf-pills-autosubmit-tab"
                      aria-controls="hconf-pills-autosubmit"
                      aria-selected="true"
                      >
                        <strong>autosubmit_.conf {configDifferences.has("conf") && alertDifferenceSpan}</strong>
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      href="#hconf-pills-expdef"
                      className="nav-link"
                      data-toggle="pill"
                      role="tab"
                      id="hconf-pills-expdef-tab"
                      aria-controls="hconf-pills-expdef"
                      aria-selected="false"
                    >
                      <strong>expdef_.conf {configDifferences.has("exp") && alertDifferenceSpan}</strong>
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      href="#hconf-pills-jobs"
                      className="nav-link"
                      data-toggle="pill"
                      role="tab"
                      id="hconf-pills-jobs-tab"
                      aria-controls="hconf-pills-jobs"
                      aria-selected="false"
                    >
                      <strong>jobs_.conf {configDifferences.has("jobs") && alertDifferenceSpan}</strong>
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      href="#hconf-pills-platforms"
                      className="nav-link"
                      data-toggle="pill"
                      role="tab"
                      id="hconf-pills-platforms-tab"
                      aria-controls="hconf-pills-platforms"
                      aria-selected="false"
                    >
                      <strong>platforms_.conf {configDifferences.has("platforms") && alertDifferenceSpan}</strong>
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      href="#hconf-pills-proj"
                      className="nav-link"
                      data-toggle="pill"
                      role="tab"
                      id="hconf-pills-proj-tab"
                      aria-controls="hconf-pills-proj"
                      aria-selected="false"
                    >
                      <strong>proj_.conf {configDifferences.has("proj") && alertDifferenceSpan}</strong>
                    </a>
                  </li>
                </ul>
                <div className="tab-content" id="hconf-pills-tabContent">
                  <div 
                    className="tab-pane fade show active"
                    id="hconf-pills-autosubmit"
                    role="tabpanel"
                    aria-labelledby="hconf-pills-autosubmit-tab"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current Run Configuration (Historical Database)</span></p>
                        {currentRunConfiguration.conf ? generateConfigFileHtml(currentRunConfiguration.conf, "conf", configDifferences, alertDifferenceSpan) : messageNoInformation}    
                      </div>
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current FileSystem Configuration</span></p>
                        {currentFileSystemConfiguration.conf ? generateConfigFileHtml(currentFileSystemConfiguration.conf, "conf", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                    </div>                  
                  </div>
                  <div 
                    className="tab-pane fade"
                    id="hconf-pills-expdef"
                    role="tabpanel"
                    aria-labelledby="hconf-pills-expdef-tab"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current Run Configuration (Historical Database)</span></p>
                        {currentRunConfiguration.exp ? generateConfigFileHtml(currentRunConfiguration.exp, "exp", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current FileSystem Configuration</span></p>
                        {currentFileSystemConfiguration.exp ? generateConfigFileHtml(currentFileSystemConfiguration.exp, "exp", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                    </div>
                    
                  </div>
                  <div 
                    className="tab-pane fade"
                    id="hconf-pills-jobs"
                    role="tabpanel"
                    aria-labelledby="hconf-pills-jobs-tab"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current Run Configuration (Historical Database)</span></p>
                        {currentRunConfiguration.jobs ? generateConfigFileHtml(currentRunConfiguration.jobs, "jobs", configDifferences, alertDifferenceSpan) : <p>{messageNoInformation}</p>}
                      </div>
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current FileSystem Configuration</span></p>
                        {currentFileSystemConfiguration.jobs ? generateConfigFileHtml(currentFileSystemConfiguration.jobs, "jobs", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                      </div>
                    </div>                                   
                  <div 
                    className="tab-pane fade"
                    id="hconf-pills-platforms"
                    role="tabpanel"
                    aria-labelledby="hconf-pills-platforms-tab"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current Run Configuration (Historical Database)</span></p>
                        {currentRunConfiguration.platforms ? generateConfigFileHtml(currentRunConfiguration.platforms, "platforms", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current FileSystem Configuration</span></p>
                        {currentFileSystemConfiguration.platforms ? generateConfigFileHtml(currentFileSystemConfiguration.platforms, "platforms", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                    </div>
                    
                  </div>
                  <div 
                    className="tab-pane fade"
                    id="hconf-pills-proj"
                    role="tabpanel"
                    aria-labelledby="hconf-pills-proj-tab"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current Run Configuration (Historical Database)</span></p>
                        {currentRunConfiguration.proj ? generateConfigFileHtml(currentRunConfiguration.proj, "proj", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                      <div className="col-md-6">
                        <p className="text-center lead"><span>Current FileSystem Configuration</span></p>
                        {currentFileSystemConfiguration.proj ? generateConfigFileHtml(currentFileSystemConfiguration.proj, "proj", configDifferences, alertDifferenceSpan) : messageNoInformation}
                      </div>
                    </div>
                    
                  </div>              
                </div>
            </div>           
          </div>             
        </div>
        </div>
      )
    }    
  } else {
    return (
      <div className="row">
        <div className="col">
          <p>
          Press <span className="badge badge-primary">SHOW CURRENT INFORMATION</span> to visualize the current configuration of your experiment. The information will be retrieved from the historical database and from the filesystem, each datasource is displayed in its own table.
          </p>
          <h4>What is the <strong>Current FileSystem Configuration</strong>?</h4>
          <p>It is the configuration of your experiment stored in the files inside the folder <strong>conf</strong>. Autosubmit GUI might have problems accessing this information if your conf files have <strong>restricted read permissions</strong>.</p>
          <h4>What is the <strong>Current Run Configuration (Historical Database)</strong>?</h4>
          <p>
            Whenever you start a new run of your experiment, the current configuration stored in the file system is stored in the historical database for reference.
          </p>
          <h4>What is a <strong>new run</strong> of the experiment?</h4>
          <p>
            A new run is created in any of these situations:            
          </p>
          <ul>
              <li><code>autosubmit create</code> is executed.</li>
              <li><code>autosubmit run</code> is executed and the historical database is empty.</li>
              <li><code>autosubmit run</code> is executed and it is detected that the number of jobs in the experiment has changed.</li>
              <li><code>autosubmit setstatus</code> and/or a significant amount of jobs changes status.</li>              
            </ul>
        </div>
      </div>
    );
  }
    
}

export default CurrentConfiguration
