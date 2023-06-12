import React, { useContext, useState } from 'react';
import OperationFinder from '../apis/OperationFinder';
import { OperationContext } from '../context/OperationContext';

const PmdQuery = () => {
  const { dt_addOperations } = useContext(OperationContext);
  const [dt_query, dt_setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await OperationFinder.post('/operation/dt/start', { dt_query });

      // Check if there was an error in the response
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      dt_addOperations(response.data.operation);

      // Reset the input value
      dt_setQuery('');
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        setError(errorData || 'Something went wrong.');
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response received from the server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(error.message);
      }
    }
  };

  const closeError = () => {
    setError('');
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <form onSubmit={handleSubmit} className="mb-4 w-50">
        <div className="row">
          <div className="col">
            <input
              value={dt_query}
              onChange={(e) => dt_setQuery(e.target.value)}
              type="text"
              className="form-control custom-input"
              placeholder="Please enter the keyword"
            />
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary custom-btn">
              Search
            </button>
          </div>
        </div>
      </form>
      {error && (
        <div className="custom-alert alert-danger">
          {error}
          <button type="button" className="close" onClick={closeError}>
            <span>&times;</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PmdQuery;
