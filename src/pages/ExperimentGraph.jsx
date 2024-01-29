import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import VisNetwork from "../common/VisNetwork";
import { autosubmitApiV3 } from "../services/autosubmitApiV3";
import useASTitle from "../hooks/useASTitle";
import useBreadcrumb from "../hooks/useBreadcrumb";
import JobDetailCard from "../common/JobDetailCard";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line
import { Network } from "vis-network/standalone";


const ExperimentGraph = () => {
  const dispatch = useDispatch()
  const authState = useSelector(state => state.auth)
  const routeParams = useParams()
  useASTitle(`Experiment ${routeParams.expid} graph`)
  useBreadcrumb([
    {
      name: `Experiment ${routeParams.expid}`,
      route: `/experiment/${routeParams.expid}`
    },
    {
      name: `Graph View`,
      route: `/experiment/${routeParams.expid}/graph`
    }
  ])

  const filterRef = useRef()
  const [activeMonitor, setActiveMonitor] = useState(false)

  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const selectedJob = jobs.find(rawNode => rawNode.id === selectedJobId);
  const [network, setNetwork] = useState(/** @type {Network | null} */(null))
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: []
  })

  const {
    data,
    isFetching,
    refetch,
    isError
  } = autosubmitApiV3.endpoints.getExperimentGraphView.useQuery({
    expid: routeParams.expid,
    layout: "standard",
    grouped: "none"
  })

  const {
    data: pklData
  } = autosubmitApiV3.endpoints.getPklInfo.useQuery({
    expid: routeParams.expid
  }, {
    skip: !activeMonitor,
    pollingInterval: 5 * 1000
  })

  useEffect(() => {
    // Unmount component
    return () => {
      const promise = dispatch(autosubmitApiV3.endpoints.showdownRoute.initiate({
        route: "graph",
        loggedUser: authState.user_id,
        expid: routeParams.expid
      }, { forceRefetch: true }))
      promise.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (Array.isArray(data?.nodes) && Array.isArray(data?.edges)) {
      setJobs([...data.nodes])
      const newNodes = data.nodes.map(node => {
        return {
          id: node.id,
          label: node.label,
          shape: node.shape,
          color: { background: node.status_color, border: "black" },
          x: node.x,
          y: node.y,
          shapeProperties: { borderDashes: node.dashed },
        }
      })
      setGraphData({
        nodes: newNodes,
        edges: data.edges
      })
    }
  }, [data])

  useEffect(() => {
    if (pklData) {
      let shouldRedraw = false

      let newJobData = {}
      pklData.pkl_content.forEach(job => {
        newJobData[job.name] = job
      })

      let changeLog = []
      const newJobs = jobs.map(job => {
        let newJob = { ...job }
        const incomingData = newJobData[job.id]

        if (newJob.status_code !== incomingData.status_code) {
          changeLog.push(`[${(new Date()).toISOString()}] ${newJob.id} change status to ${incomingData.status_code}`)
          network.body.nodes[newJob.id].options.color.background = incomingData.status_color
          shouldRedraw = true
        }

        // Overwrite data
        newJob.status_code = incomingData.status_code
        newJob.status = incomingData.status
        newJob.status_color = incomingData.status_color
        newJob.package = incomingData.package
        newJob.dashed = incomingData.dashed
        newJob.out = incomingData.out;
        newJob.err = incomingData.err;
        newJob.minutes = incomingData.minutes;
        newJob.minutes_queue = incomingData.minutes_queue;
        newJob.submit = incomingData.submit;
        newJob.start = incomingData.start;
        newJob.finish = incomingData.finish;
        newJob.rm_id = incomingData.rm_id;
        newJob.SYPD = incomingData.SYPD;

        return newJob
      })

      if (shouldRedraw) network.redraw()

      // Refresh Job List
      setJobs(newJobs)
    }

    // eslint-disable-next-line
  }, [pklData])

  /** @param {Network} newNetwork */
  const handleNetworkCallback = (newNetwork) => { setNetwork(newNetwork) }

  const handleOnSelectNode = (nodeId) => {
    setSelectedJobId(nodeId)
  }

  const handleFilter = (e) => {
    e.preventDefault();
    const searchValue = filterRef.current.value
    if (network) {
      if (searchValue) {
        const selectedNodesIds = graphData.nodes.filter(
          item => item.id.toUpperCase().includes(searchValue.toUpperCase())
        ).map(item => item.id)
        network.selectNodes(selectedNodesIds)
        network.fit({
          nodes: selectedNodesIds
        })
        if (selectedNodesIds.length > 0) handleOnSelectNode(selectedNodesIds[0])
      } else {
        handleClear()
      }
    }
  }

  const handleClear = () => {
    filterRef.current.value = ""
    if (network) {
      network.unselectAll()
      network.fit()
    }
  }

  const handleCloseJobDetail = () => { setSelectedJobId(null) }

  const toggleActiveMonitor = () => { setActiveMonitor(!activeMonitor); }

  return (
    <div className="w-100 d-flex flex-column">
      {
        (isError || data?.error) &&
        <span className="alert alert-danger rounded-4 px-4">
          <i className="fa-solid fa-triangle-exclamation me-2"></i> {data?.error_message || "Unknown error"}
        </span>
      }
      <div className="d-flex mb-3 gap-2 align-items-center flex-wrap">
        <div className="flex-fill">
          <form className="input-group" onSubmit={handleFilter}>
            <input ref={filterRef}
              className="form-control" placeholder="Filter job..." />
            <button type="submit" className="btn btn-dark fw-bold px-4">Filter</button>
            <button type="button" className="btn btn-light border fw-bold px-4" onClick={handleClear}>Clear</button>
          </form>
        </div>
        <button className={"btn fw-bold text-white px-4 text-nowrap " + (activeMonitor ? "btn-danger" : "btn-success")}
          onClick={toggleActiveMonitor}>
          {activeMonitor ? "STOP MONITORING" : "START MONITOR"}
        </button>
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
          <div className="d-flex w-100 gap-3 justify-content-center flex-wrap">

            <div className="col d-flex flex-column gap-3 flex-wrap" style={{ minWidth: "min(30rem,90vw)" }}>
              <div className="d-flex gap-2 align-items-center justify-content-between">
                <span className="mx-2 small">
                  Total #Jobs: {data.total_jobs} | Chunk unit: {data.chunk_unit} | Chunk size: {data.chunk_size}
                </span>
              </div>


              <div className="border">
                <VisNetwork
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  onSelectNode={handleOnSelectNode}
                  networkCallback={handleNetworkCallback}
                />
              </div>
            </div>

            <JobDetailCard
              jobData={selectedJob}
              jobs={jobs}
              onClose={handleCloseJobDetail} />

          </div>

      }
    </div>
  )
}

export default ExperimentGraph