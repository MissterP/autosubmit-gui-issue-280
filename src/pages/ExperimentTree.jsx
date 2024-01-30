import { useEffect, useRef, useState } from "react";
import { autosubmitApiV3 } from "../services/autosubmitApiV3";
import { useParams } from "react-router-dom";
import FancyTree from "../common/FancyTree";
import useASTitle from "../hooks/useASTitle";
import useBreadcrumb from "../hooks/useBreadcrumb";
import JobDetailCard from "../common/JobDetailCard";
import { useDispatch, useSelector } from "react-redux";
import RunsModal from "../common/RunsModal";
import TreeContentHandler from "../components/context/tree/business/treeUpdate";


const ExperimentTree = () => {
  const dispatch = useDispatch()
  const authState = useSelector(state => state.auth)
  const routeParams = useParams()
  useASTitle(`Experiment ${routeParams.expid} tree`)
  useBreadcrumb([
    {
      name: `Experiment ${routeParams.expid}`,
      route: `/experiment/${routeParams.expid}`
    },
    {
      name: `Tree View`,
      route: `/experiment/${routeParams.expid}/tree`
    }
  ])

  const [showRunsM, setShowRunsM] = useState(false)
  const [selectedRun, setSelectedRun] = useState({
    run_id: null,
    created: null
  })

  const [tree, setTree] = useState(/** @type {Fancytree.Fancytree} */(null))
  const filterRef = useRef()

  const [activeMonitor, setActiveMonitor] = useState(false)

  // const abortController = new AbortController()
  const {
    data,
    isFetching,
    refetch,
    isError
  } = autosubmitApiV3.endpoints.getExperimentTreeView.useQuery({
    expid: routeParams.expid,
    // signal: abortController.signal,
    runId: selectedRun?.run_id
  })

  const {
    data: pklData
  } = autosubmitApiV3.endpoints.getPklTreeInfo.useQuery({
    expid: routeParams.expid
  }, {
    skip: (!activeMonitor) || (selectedRun?.run_id),
    pollingInterval: 5 * 1000
  })

  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const selectedJob = jobs.find(item => item.label === selectedJobId)

  useEffect(() => {
    // Unmount component
    return () => {
      // abortController.abort()
      const promise = dispatch(autosubmitApiV3.endpoints.showdownRoute.initiate({
        route: "tree",
        loggedUser: authState.user_id,
        expid: routeParams.expid
      }, { forceRefetch: true }))
      promise.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const newJobs = (data?.jobs || [])
    setJobs(newJobs)
  }, [data])

  useEffect(() => {
    let treeUpdater = new TreeContentHandler(
      jobs,
      (data?.reference || {}),
      pklData,
      false
    )

    if (tree && treeUpdater.validate()) {
      const processResult = treeUpdater.processChanges(tree);
      if (Array.isArray(processResult?.currentJobs)) {
        setJobs(processResult.currentJobs)
      }
    }
  }, [pklData])


  const handleOnActivateNode = (e, d) => {
    if (Array.isArray(jobs) && d?.node && d.node.folder === undefined) {
      setSelectedJobId(d.node.refKey)
    }
  }

  const handleTreeCallback = (tree) => { setTree(tree) }

  const handleExpand = () => { if (tree) tree.expandAll() }
  const handleCollapse = () => { if (tree) tree.expandAll(false) }

  const handleFilter = (e) => {
    e.preventDefault();
    if (tree) {
      if (filterRef.current.value) {
        tree.filterNodes(filterRef.current.value)
      } else {
        tree.clearFilter()
      }
    }
  }

  const handleClear = () => {
    filterRef.current.value = ""
    if (tree) tree.clearFilter()
  }

  const handleCloseJobDetail = () => { setSelectedJobId(null) }

  const handleRunSelect = (item) => {
    handleClear();
    setSelectedRun(item);
    setShowRunsM(false)
  }

  const handleResetRun = () => {
    handleRunSelect({
      run_id: null,
      created: null
    })
  }

  const toggleActiveMonitor = () => { setActiveMonitor(!activeMonitor); }

  const toggleShowRunsM = () => { setShowRunsM(!showRunsM) }

  return (
    <>
      <RunsModal show={showRunsM}
        onHide={toggleShowRunsM}
        expid={routeParams.expid}
        onRunSelect={handleRunSelect}
      />
      <div className="w-100 d-flex flex-column">
        {
          (isError || data?.error) &&
          <span className="alert alert-danger rounded-4 px-4">
            <i className="fa-solid fa-triangle-exclamation me-2"></i> {data?.error_message || "Unknown error"}
          </span>
        }
        <div className="d-flex mb-3 gap-2 align-items-center flex-wrap">
          <div>
            <div className="input-group">
              <button className="btn btn-primary fw-bold text-white"
                title="Select Run"
                onClick={toggleShowRunsM}>
                <i className="fa-solid fa-clock-rotate-left me-2"></i> Run: {(selectedRun.run_id && selectedRun.created) || "Latest"}
              </button>
              {
                (selectedRun?.run_id) &&
                <button className="btn btn-light border-primary text-primary"
                  title="Reset to latest"
                  onClick={handleResetRun}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              }
            </div>
          </div>
          <div className="flex-fill">
            <form className="input-group" onSubmit={handleFilter}>
              <input ref={filterRef}
                className="form-control" placeholder="Filter job..." />
              <button type="submit" className="btn btn-dark fw-bold px-4">Filter</button>
              <button type="button" className="btn btn-light border fw-bold px-4" onClick={handleClear}>Clear</button>
            </form>
          </div>
          {
            (!selectedRun?.run_id) &&
            <button
              className={"btn fw-bold text-white px-4 text-nowrap " + (activeMonitor ? "btn-danger" : "btn-success")}
              onClick={toggleActiveMonitor}>
              {activeMonitor ? "STOP MONITORING" : "START MONITOR"}
            </button>
          }
          <button className="btn btn-success fw-bold text-white"
            title="Refresh data"
            onClick={() => { refetch() }}>
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
        {
          isFetching ?
            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="spinner-border" role="status"></div>
            </div>
            :
            data &&
            <div className="d-flex w-100 gap-3 flex-wrap d-flex flex-fill gap-3 justify-content-center">

              <div className="flex-fill d-flex flex-column gap-3 flex-wrap">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                  <span className="mx-2 small">Total #Jobs: {data.total} | Chunk unit: {data?.reference?.chunk_unit} | Chunk size: {data?.reference?.chunk_size}</span>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary text-white fw-bold px-4" onClick={handleExpand}>Expand All +</button>
                    <button className="btn btn-sm btn-secondary text-white fw-bold px-4" onClick={handleCollapse}>Collapse All -</button>
                  </div>
                </div>
                <div className="border rounded-4 p-3 flex-fill">
                  <div className="overflow-auto" style={{ maxHeight: "75vh", maxWidth: "80vw" }}>
                    <FancyTree treeData={data.tree}
                      onActivateNode={handleOnActivateNode}
                      treeCallback={handleTreeCallback} />
                  </div>

                </div>
              </div>

              <JobDetailCard
                jobData={selectedJob}
                jobs={jobs}
                onClose={handleCloseJobDetail}
              />
            </div>
        }
      </div>
    </>

  )
}

export default ExperimentTree