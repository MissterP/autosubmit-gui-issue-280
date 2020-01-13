import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ExperimentItem = ({ experiment: { name, description, user, hpc, status } }) => {
  return (
    <div className='card'>
      {/* <img
        src={avatar_url}
        alt=''
        className='round-img'
        style={{ width: '60px' }}
      /> */}
      <div className="card-header text-center">
        <div className="row">
          <div className="col-6 text-left">
            <h3 className="font-weight-bold">{name}</h3>
          </div>
          <div className="col-6 text-right">
              {status && status === "RUNNING" && <span className='badge badge-success text-right'>{status}</span>}
              {status && status !== "RUNNING" && <span className='badge badge-secondary text-right'>{status}</span>}
          </div>
        </div>
        
      </div>
      <div className="card-body">
        {/* <h4 className="card-title"></h4> */}
        <h6 className="card-subtitle text-muted">Owner: {user}</h6>
        <p className="card-text">{description}</p>        
        <Link to={`/autosubmitapp/experiment/${name}`} className='btn btn-outline-primary btn-block'>
          More
        </Link>
        <p className="card-text text-center"><small className="text-muted">HPC: {hpc}</small></p>
      </div>
      {/* <h3>{name}</h3>
      <p>{description}</p>
      <p><strong>{user}</strong></p>
      <small>{hpc}</small> */}
      {/* <div>
        <Link to={`/experiment/${name}`} className='btn btn-dark btn-sm my-1'>
          More
        </Link>
      </div> */}
    </div>
  );
};

ExperimentItem.propTypes = {
  experiment: PropTypes.object.isRequired
};

export default ExperimentItem;
