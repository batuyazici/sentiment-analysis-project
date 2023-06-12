import { OperationContext } from '../context/OperationContext';
import React, {useEffect, useState, useContext} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import OperationFinder from '../apis/OperationFinder';
import { Chart as ChartJS, ArcElement,  Tooltip, Legend, } from 'chart.js';
import{Pie} from 'react-chartjs-2';
import LoadingGif from '../assets/loading.gif';
import LoadingSpinner from '../elements/LoadingSpinner';
import { 
  LineChart, Line, XAxis, YAxis, Label, Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, CartesianGrid
} from 'recharts';

import { TagCloud } from 'react-tagcloud';
import BackButton from '../elements/BackButton';
import Footer from '../elements/Footer';

ChartJS.register (
  ArcElement,Tooltip, Legend
)

function TwitterMonitor(){
  const {results, setResults, wordResults, setWordResults} = useContext(OperationContext) 
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [resultsResponse, wordResultsResponse] = await Promise.all([
          OperationFinder.get(`/result/id/${id}`),
          OperationFinder.get(`/result/word/id/${id}`)
        ]);
        
         setResults(JSON.parse(resultsResponse.data));
         setWordResults(JSON.parse(wordResultsResponse.data));

        if (isMounted) {
          setIsLoading(false);

        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setResults([]);
          setWordResults([]);
          setIsLoading(false);
        }

      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, setResults, setWordResults, query]);
  
  if (isLoading) {
    return (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <div>
    <LoadingSpinner loadingTextUrl={LoadingGif} />
  </div>
</div>
      );
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  for (const result of results) {
    if (result.Sentiment === 'Positive') {
      positiveCount++;
    } else if (result.Sentiment === 'Neutral') {
      neutralCount++;
    } else if (result.Sentiment === 'Negative') {
      negativeCount++;
    }
  }

  const positiveColumn = results.map((item) => Number(item.Positive));
  const positiveSum = positiveColumn.reduce((acc, curr) => acc + curr, 0);
  const positiveAverage = positiveSum / positiveColumn.length;
  
  const negativeColumn = results.map((item2) => Number(item2.Negative));
  const negativeSum = negativeColumn.reduce((acc, curr) => acc + curr, 0);
  const negativeAverage = negativeSum / negativeColumn.length;

  const neutralColumn = results.map((item3) => Number(item3.Neutral));
  const neutralSum = neutralColumn.reduce((acc, curr) => acc + curr, 0);
  const neutralAverage = neutralSum / neutralColumn.length;

  const monthNamesArray = results.reduce((acc, obj) => {
    const monthName = new Date(obj.Date).toLocaleString('en-EN', { month: 'long' });
    if (!acc.find(item => item.monthName === monthName)) {
      acc.push({ monthName });
    }
    return acc;
  }, []);
  
  function getXAxisTickFormatter(monthNamesArray) {
    return (value, index) => {
      const currentMonth = monthNamesArray[index].monthName;
      const nextMonth = index < monthNamesArray.length - 1 ? monthNamesArray[index + 1].monthName : null;
      return nextMonth === currentMonth ? '' : currentMonth;
    };
  }
  
  const groupedData = monthNamesArray.map(monthObj => {
    const monthName = monthObj.monthName;
    const tweetsInMonth = results.filter(obj => new Date(obj.Date).toLocaleString('en-EN', { month: 'long' }) === monthName);
    const numTweets = tweetsInMonth.length;
    const avgNegative = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.Negative), 0) / numTweets).toFixed(3) : 0;
    const avgNeutral = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.Neutral), 0) / numTweets).toFixed(3) : 0;
    const avgPositive = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.Positive), 0) / numTweets).toFixed(3) : 0;
    return {
      monthName,
      Negative: avgNegative,
      Neutral: avgNeutral,
      Positive: avgPositive
    };
});

const dates = results.map((obj) => new Date(obj.Date));
const earliestYear = Math.min(...dates.map((date) => date.getFullYear()));
const latestYear = Math.max(...dates.map((date) => date.getFullYear()));

const data2 = {
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [
    {
      label: 'Sentiment Score',
      data: [positiveAverage, neutralAverage, negativeAverage],
      borderColor: 'black',
      backgroundColor: ['rgb(60,179,113)', '#5486b4', '#9a0000'],
      hoverOffset:4,
    },
  ],
};
  const options2 = {
      plugins: {  
      legend: {
      labels: {
            color: 'black',    
            font: {
            size: 15,
            weight: 'bold'
                  }
              }
          }
        }
  };

  const tags = Object.entries(wordResults).map(([value, count]) => ({ value, count }));


const customRenderer = (tag, size, color) => {
  let tagColor = '#5486b4'; // Default color if no condition is met

  if (tag.value.startsWith('@')) {
    tagColor = '#85B1D4'; // Set color to red if the tag starts with '@'
  } else if (tag.value.startsWith('#')) {
    tagColor = '#C1DBD1'; // Set color to green if the tag starts with '#'
  } else {
    tagColor = '#C9A5B6'; // Set color to blue for all other tags
  }

  return (
    <span
      key={tag.value}
      className="tag-cloud-tag"
      style={{
        fontSize: `${size / 2}em`,
        borderRadius: '10px',
        margin: '8px',
        padding: '10px',
        display: 'inline-block',
        color: 'black',
        fontWeight: 'bold',
        background: tagColor,
      }}
    >
      {tag.value}
      <span className="tag-cloud-count">{tag.count}</span>
    </span>
  );
};

const colorIndicatorStyle = {
  width: '40px',
  height: '20px',
  display: 'inline-block',
  marginRight: '5px',
  border: '2px solid black',
};

  return (
<div>
          <div style={{margin:'10px 0 -10px -130px'}}>
          <BackButton/>
          </div>
        
    <div className='container-fluid'>
  <div className='row align-items-center'>
  <div className='d-flex justify-content-center' style={{marginBottom:'25px'}}>
  <div className="card queryinfo" style={{width: '69%',textAlign:'center', boxShadow: '0 0 3px rgba(0, 0, 0, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
  <ul className="list-group list-group-flush" style={{boxShadow: '0 0 3px rgba(0, 0, 0, 0.9)'}} >
    <li className="list-group-item border-black" style ={{fontSize:'27px'}}>Query:  <span style= {{ fontWeight:'bold' }}>{query}</span></li>
    <li className="list-group-item border-black" style ={{fontSize:'18px'}}>Number of tweets: <span style= { { fontWeight:'bold', fontSize:'25px'}}>{results.length}</span></li>
    <li className="list-group-item border-black" style ={{fontSize:'18px'}}>Positive Labeled Tweets Number: <span style= {{ fontWeight:'bold', fontSize:'25px' }}>{positiveCount}</span></li>
        <li className="list-group-item border-black" style ={{fontSize:'18px'}}>Negative Labeled Tweets Number: <span style= {{fontWeight:'bold', fontSize:'25px' }}>{negativeCount}</span></li>
        <li className="list-group-item border-black" style ={{fontSize:'18px'}}>Neutral Labeled Tweets Number: <span style= {{ fontWeight:'bold', fontSize:'25px' }}>{neutralCount}</span></li>
  </ul>
</div>
</div>
    <div className='col'>
      <div className='d-flex justify-content-center' style={{margin: '0 0 25px 0'}}>

      <div className='card Pie' style={{ width: '38%', height: 'auto' }}>
          <h4 className='card-header' style={{textAlign:'center'}}>
            Average Sentiment Score 
          </h4>
          <div className='card-body' style={{ display: 'flex', justifyContent: 'center', padding:'0'}}>
            <Pie data={data2} options={options2} />
          </div>
          <div className="card-footer">
        This Pie graph shows the Sentiment Average (Negative, Positive, Neutral) score. You can hover over it and see the scores clearly.
  </div>
        </div>
        <div className='card' style={{ width: '55%', height: 'auto', boxShadow: '0 0 3px rgba(0, 0, 0, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
  <h4 className='card-header' style={{ textAlign: 'center' }}>
    Word Cloud
  </h4>
  <div className='card-body' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',padding:'5px 16px 16px 16px' }}>
  <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 5px 0' }}>
      <div style={{ ...colorIndicatorStyle, background: '#85B1D4' }}></div>
      <span style={{ marginLeft: '5px', fontFamily: 'Arial Narrow', textAlign: 'center',fontWeight:'bold', color:'black',fontSize:'17px'}}>Tags starting with '@'</span>

      <div style={{ ...colorIndicatorStyle, background: '#C1DBD1', marginLeft: '5px', }}></div>
      <span style={{ marginLeft: '10px', fontFamily: 'Arial Narrow', marginRight: '5px', color:'black', fontWeight:'bold',fontSize:'17px'}}>Tags starting with '#'</span>

      <div style={{ ...colorIndicatorStyle, background: '#C9A5B6' }}></div>
      <span style={{ marginLeft: '10px', fontFamily: 'Arial Narrow', color:'black', fontWeight:'bold', fontSize:'17px'}}>Words</span>
    </div>
    <TagCloud
      tags={tags}
      minSize={3}
      maxSize={5}
      colorOptions={{ hue: 'blue' }}
      style={{
        textAlign: 'center',
        fontSize: '19px',
        fontFamily: 'Consolas',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
      renderer={customRenderer}
    />

  </div>
  <div className="card-footer">
    This section shows the most used words in tweets. The largest is the most used word, and the smallest is the least used word.
  </div>
</div>
  
    </div>

      <div className='d-flex justify-content-center'>
        <div className= 'card' style={{ width: '93%', height: 'auto', marginBottom:'25px', boxShadow: '0 0 3px rgba(0, 0, 0, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
        <h4 className='card-header' style={{textAlign:'center'}}>
        Polarity of Average Sentiment Score Over Months Line Graph 
          </h4>
          <div className='card-body' style={{ padding: '10px',  }}>
          {earliestYear !== latestYear ? (
  <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
    The average monthly tweet count was calculated between the earliest year and the latest year, which are <span style={{ fontSize: '21px', textDecoration: 'underline' }}>{earliestYear} and {latestYear}.</span>
  </p>
) : (
  <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
    The average monthly tweet count was calculated in one year, which is <span style={{ fontSize: '21px', textDecoration: 'underline' }}>{latestYear}.</span>
  </p>
)}

          <LineChart
            data={groupedData}
            width={1350}
            height={400}
            margin={{ top: 5, bottom: 5, right: 10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" />
            <XAxis style={{ fontSize: '20px', }} dataKey="index" tick={{ angle: -30, fill: '#000' }}
              textAnchor='end' height={100} tickFormatter={getXAxisTickFormatter(monthNamesArray)}
              axisLine={{ stroke: '#000', strokeWidth: 2 }}>
                <Label
              value="[Months]"
              offset={15} position="insideBottom"
              style={{ textAnchor: 'middle', fontSize: 'bold', fontWeight: 'bold', fill:'black' }}/>
              </XAxis>
            <YAxis style={{ fontSize: '20px', }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fill: '#000' }} ticks={[0, 0.5, 1]}>
            <Label
            value="[Polarity Score]"
            position="insideLeft"
             angle={-90}
            offset={10}
            style={{ textAnchor: 'middle', fontSize: 'bold', fontWeight: 'bold', fill:'black' }} />
            </YAxis>
            <RechartsTooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            <RechartsLegend wrapperStyle={{ fontSize: "20px", fontWeight: "bold" }} />
            <Line type="monotone" dataKey="Negative" stroke='#340000' strokeWidth={3} activeDot={{ r: 6 }} strokeLinecap="round" strokeLinejoin="round" />
            <Line type="monotone" dataKey="Neutral" stroke='#05294a' strokeWidth={3} activeDot={{ r: 6 }} strokeLinecap="round" strokeLinejoin="round" />
            <Line type="monotone" dataKey="Positive" stroke='#1b5233' strokeWidth={3} activeDot={{ r: 6 }} strokeLinecap="round" strokeLinejoin="round" />
          </LineChart>
        </div>
        <div className="card-footer">
        This line graph illustrates the temporal change of emotional evaluation, with positions near 1 indicating positive sentiment, positions near 0.5 representing neutral or mixed evaluations, and positions close to 0 indicating negative sentiment. Hovering over the graph allows clear visibility of the sentiment average scores (Negative, Positive, Neutral).  </div>
        </div>
      </div>
    </div>
  </div>
</div>
<Footer/>
  </div>
  );
}

export default TwitterMonitor;
