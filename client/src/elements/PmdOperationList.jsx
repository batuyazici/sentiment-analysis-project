import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import OperationFinder from '../apis/OperationFinder'; 
import { OperationContext } from '../context/OperationContext';

const PmdOperationList = () => {
  const { dt_operations, dt_setOperations } = useContext(OperationContext);
  const [sortedOperations, setSortedOperations] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await OperationFinder.get("/operation/dt");
        if (isMounted) {
          dt_setOperations(response.data);
        }
      } catch (err) {}
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [dt_setOperations]);

  useEffect(() => {
    const sortedOps = [...dt_operations].sort((a, b) => {
      const startTimeA = new Date(a.start_time);
      const startTimeB = new Date(b.start_time);
      return startTimeA - startTimeB;
    });
    setSortedOperations(sortedOps);
  }, [dt_operations]);
  
  const renderStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#7cab68',
            borderRadius: '5px',
            display: 'inline-block',
            padding: '5px',
          }}
        >
          Completed
        </span>
      );
    } else if (status === 'Noresult') {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#cc6600',
            borderRadius: '5px',
            display: 'inline-block',
            padding: '5px',
          }}
        >
          No Result
        </span>
      );
    } else {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#2a3047',
            borderRadius: '5px',
            display: 'inline-block',
            padding: '5px',
          }}
        >
          Pending
        </span>
      );
    }
  };

  return (
    <div className="list-group">
      <div className="d-flex justify-content-center">
        <table className="" style={{ width: '80%', borderRadius: '10px' }}>
          <thead>
            <tr className="bg-primary fs-5">
              <th scope="col">Query</th>
              <th scope="col">Date</th>
              <th scope="col" style={{textAlign: 'center'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedOperations.map((e) => (
              <tr key={e.op_dt_id}>
                <td className="fs-5 link-text">
                  {e.status === 'Noresult' || e.status === 'Pending' ? (
                    <span>{e.query}</span>
                  ) : (
                    <Link
                      to={`/pmd/monitor/${e.op_dt_id}?query=${encodeURIComponent(e.query)}`}
                    >
                      {e.query}
                    </Link>
                  )}
                </td>
                <td className="fs-5">{e.start_time.slice(0, 10)}</td>
                <td className="fs-5" style={{textAlign: 'center'}}>
                  {e.status ? (
                    renderStatusBadge(e.status)
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#ff0000',
                        borderRadius: '5px',
                        display: 'inline-block',
                        padding: '5px',
                      }}
                    >
                      No Result
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
                      
export default PmdOperationList;
