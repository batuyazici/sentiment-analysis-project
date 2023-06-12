import React, { useEffect, useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import OperationFinder from '../apis/OperationFinder';
import { OperationContext } from '../context/OperationContext';

const OperationList = (props) => {
  const { operations, setOperations } = useContext(OperationContext);
  const [sortedOperations, setSortedOperations] = useState([]);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await OperationFinder.get('/operation/');
        if (isMounted) {
          setOperations(response.data);
        }
      } catch (err) {}
    };

    fetchData();

    intervalIdRef.current = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalIdRef.current);
    };
  }, [setOperations]);

  useEffect(() => {
    const sortedOps = [...operations].sort((a, b) => {
      const startTimeA = new Date(a.start_time);
      const startTimeB = new Date(b.start_time);
      return startTimeA - startTimeB;
    });
    setSortedOperations(sortedOps);
  }, [operations]);

  useEffect(() => {
    return () => {
      clearInterval(intervalIdRef.current);
    };
  }, []);


  return (

    <div className='list-group'>
  <div className="d-flex justify-content-center">
  <table className="" style={{ width: '80%', borderRadius: '10px' }}>
  <thead>
    <tr className="bg-primary fs-5">
      <th scope="col">Username</th>
      <th scope="col">Date</th>
      <th scope="col" style={{ textAlign: 'center' }}>Status</th>
    </tr>
  </thead>
  <tbody>
    {sortedOperations.map(e => {
      let badgeColor = '';
      let statusText = '';

      if (e.status === 'Completed') {
        badgeColor = '#7cab68';
        statusText = 'Completed';
      } else if (e.status === 'Pending') {
        badgeColor = '#2a3047';
        statusText = 'Pending';
      } else if (e.status === 'Failed') {
        badgeColor = 'red';
        statusText = 'Failed';
      }

      return (
        <tr key={e.op_id}>
          <td className="fs-5 link-text">
            {e.status === 'Noresult' || e.status === 'Pending' ? (
              <span>{e.query}</span>
            ) : (
              <Link
                to={`/twitter/monitor/${e.op_id}?query=${encodeURIComponent(e.query)}`}>
                {e.query}
              </Link>
            )}
          </td>
          <td className="fs-5">{e.start_time.slice(0, 10)}</td>
          <td className="fs-5" style={{ textAlign: 'center' }}>
            <span
              className="badge"
              style={{
                backgroundColor: badgeColor,
                borderRadius: '5px',
                display: 'inline-block',
                padding: '5px'
              }}
            >
              {statusText}
            </span>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
  </div>
</div>

  )
}

export default OperationList