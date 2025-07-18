export const ERROR_MESSAGE =
  "Autosubmit API couldn't retrieve the requested information on time. It might be due to a network error or heavy traffic on the shared folders that Autosubmit uses to store experiment information."; // Default error message

// Job status codes. Sames a in Autosubmit and Autosubmit API.
export const WaitingCode = 0;
export const FailedCode = -1;
export const CompletedCode = 5;
export const RunningCode = 4;
export const QueueCode = 3;
export const SubmittedCode = 2;
export const UnknownCode = -2;
export const SuspendedCode = -3;
export const HoldCode = 6;
export const ReadyCode = 1;
export const PreparedCode = 7;
export const SkippedCode = 8;

export const UpperLimitQuickView = 200; // Maximum time to spend waiting for the quick view to load

export const maxResponseTimeThreshold = 240; // 4 minutes
export const quickThreshold = 12000;

export const latestNewsLabel = "new-11-10-2021";

export const queueColor = {
  background: "lightpink",
  fontWeight: "bold",
};
export const failedColor = {
  background: "red",
  fontWeight: "bold",
  color: "white",
};
export const completedColor = {
  background: "yellow",
  fontWeight: "bold",
};
export const submittedColor = {
  background: "cyan",
  fontWeight: "bold",
};
export const runningColor = {
  background: "green",
  fontWeight: "bold",
  color: "white",
};
export const readyColor = {
  background: "lightblue",
  fontWeight: "bold",
};
export const waitingColor = {
  background: "gray",
  fontWeight: "bold",
  color: "white",
};
export const unknownColor = {
  background: "white",
  color: "black",
  fontWeight: "bold",
};
export const suspendedColor = {
  background: "orange",
  fontWeight: "bold",
  color: "black",
};
export const holdColor = {
  background: "salmon",
  fontWeight: "bold",
  color: "white",
};
export const preparedColor = {
  background: "lightsalmon",
  fontWeight: "bold",
};
export const skippedColor = {
  background: "lightyellow",
  fontWeight: "bold",
};

export const failedQueueColor = "lightSalmon";
export const failedRunAttempts = "#ff6666";
export const runStatColor = "#40bf40";

export const statusCodeToStyle = (code) => {
  if (code === WaitingCode) return waitingColor;
  if (code === FailedCode) return failedColor;
  if (code === CompletedCode) return completedColor;
  if (code === RunningCode) return runningColor;
  if (code === QueueCode) return queueColor;
  if (code === SubmittedCode) return submittedColor;
  if (code === UnknownCode) return unknownColor;
  if (code === SuspendedCode) return suspendedColor;
  if (code === HoldCode) return holdColor;
  if (code === ReadyCode) return readyColor;
  if (code === PreparedCode) return preparedColor;
  if (code === SkippedCode) return skippedColor;
  return unknownColor;
};

export const localStorageExperimentTypeSearch = "experimentTypeSearch";
export const localStorageExperimentActiveCheck = "activeCheckSearch";

export const pageSize = 12;

export const orderByType = {
  total: "Total Number of Jobs (Desc)",
  total_asc: "Total Number of Jobs (Asc)",
  completed: "Number of Completed Jobs (Desc)",
  completed_asc: "Number of Completed Jobs (Asc)",
  name: "Name of Experiment (Desc)",
  name_asc: "Name of Experiments (Asc)",
  updated: "Update Time (Desc)",
  updated_asc: "Update Time (Asc)",
  queuing: "Number of Queuing Jobs",
  running: "Number of Running Jobs",
  failed: "Number of Failed Jobs",
  wrapper: "Name of Wrapper",
  showOnlyActive: "Only Active",
  showAllActiveInactive: "Active & Inactive",
  radioExperiments: "Only Experiments",
  radioTests: "Only Tests",
  radioAll: "Experiments & Tests",
};

export const simpleExperimentType = {
  Experiment: "experiment",
  Test: "test",
  All: "all",
};

export const simpleActiveStatus = {
  All: "all",
  Active: "active",
};

export const defaultPerformanceDisplaySettings = {
  JPSYvsCHSY: false,
  JPSYvsSYPD: false,
  JPSYvsASYPD: false,
  SYPDvsASYPD: false,
  CHSYvsSYPD: false,
  CHSYvsASYPD: false,
  RunVsSYPD: false,
  RunVsCHSY: false,
  QueueRunVsASYPD: false,
};
