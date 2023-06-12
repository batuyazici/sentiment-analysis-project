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

function PmdMonitor() {
  const { dt_results, dt_setResults, dt_wordResults, dt_setWordResults } = useContext(OperationContext);
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
          OperationFinder.get(`/result/dt/id/${id}`, { headers: { 'Content-Type': 'application/json' } }),
          OperationFinder.get(`/result/dt/word/id/${id}`, { headers: { 'Content-Type': 'application/json' } })
        ]);

        const results = resultsResponse.data;
        const wordResults = wordResultsResponse.data;
    
        if (isMounted) {
          dt_setResults(results);
          dt_setWordResults(wordResults);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        // Handle error by setting dt_results and dt_wordResults to empty arrays
        if (isMounted) {
          dt_setResults([]);
          dt_setWordResults([]);
          setIsLoading(false);
        }
      }
    };
    

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, dt_setResults, dt_setWordResults, query]);

  if (isLoading) {
    return (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <div>
    <LoadingSpinner loadingTextUrl={LoadingGif} />
  </div>
</div>
    );
  }
  console.log(dt_results);
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  let data2 = {};
  let options2 = {};
  let groupedData = {};
  let tags = {};
  let monthNamesArray = [];
  
  function getXAxisTickFormatter(monthNamesArray) {
    return (value, index) => {
      const currentMonth = monthNamesArray[index].monthName;
      const nextMonth = index < monthNamesArray.length - 1 ? monthNamesArray[index + 1].monthName : null;
      return nextMonth === currentMonth ? '' : currentMonth;
    };
  }
  
  // 1. Batch Processing: Split dt_results into smaller batches using array chunking
  const batchedResults = [];
  const batchSize = 7500; // Set the batch size
  
  for (let i = 0; i < dt_results.length; i += batchSize) {
    const batch = dt_results.slice(i, i + batchSize);
    batchedResults.push(batch);
  }
  
  // Process each batch separately
  for (let k = 0; k < batchedResults.length; k++) {
    const batch = batchedResults[k];
    const sentimentCounts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0
    };
  
    for (let i = 0; i < batch.length; i++) {
      const result = batch[i];
      sentimentCounts[result.sentiment]++;
    }
  
    positiveCount += sentimentCounts.Positive;
    neutralCount += sentimentCounts.Neutral;
    negativeCount += sentimentCounts.Negative;
  
    const positiveColumn = new Array(batch.length);
    const negativeColumn = new Array(batch.length);
    const neutralColumn = new Array(batch.length);
  
    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      positiveColumn[i] = Number(item.positive);
      negativeColumn[i] = Number(item.negative);
      neutralColumn[i] = Number(item.neutral);
    }
  
    const positiveSum = positiveColumn.reduce((acc, curr) => acc + curr, 0);
    const negativeSum = negativeColumn.reduce((acc, curr) => acc + curr, 0);
    const neutralSum = neutralColumn.reduce((acc, curr) => acc + curr, 0);
  
    const positiveAverage = positiveSum / positiveColumn.length;
    const negativeAverage = negativeSum / negativeColumn.length;
    const neutralAverage = neutralSum / neutralColumn.length;
  
    const monthNamesMap = new Map();
  
    for (let i = 0; i < batch.length; i++) {
      const obj = batch[i];
      const monthName = new Date(obj.date).toLocaleString('en-EN', { month: 'long' });
      monthNamesMap.set(monthName, true);
    }
  
    monthNamesArray = Array.from(monthNamesMap.keys()).map((monthName) => ({ monthName }));
  
    getXAxisTickFormatter(monthNamesArray);
  
    groupedData = monthNamesArray.map((monthObj) => {
      const monthName = monthObj.monthName;
      const tweetsInMonth = batch.filter((obj) => new Date(obj.date).toLocaleString('en-EN', { month: 'long' }) === monthName);
      const numTweets = tweetsInMonth.length;
      const avgNegative = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.negative), 0) / numTweets).toFixed(3) : 0;
      const avgNeutral = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.neutral), 0) / numTweets).toFixed(3) : 0;
      const avgPositive = numTweets > 0 ? (tweetsInMonth.reduce((sum, obj) => sum + parseFloat(obj.positive), 0) / numTweets).toFixed(3) : 0;
      return {
        monthName,
        Negative: avgNegative,
        Neutral: avgNeutral,
        Positive: avgPositive
      };
    });
  
    data2 = {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [
        {
          label: 'Sentiment Score',
          data: [positiveAverage, neutralAverage, negativeAverage],
          borderColor: 'black',
          backgroundColor: ['rgb(60,179,113)', '#5486b4', '#9a0000'],
          hoverOffset: 4,

        },
      ],
    };
  
    options2 = {
      plugins: {
        legend: {
          labels: {
            color: 'black',
            font: {
              size: 15,
              weight: 'bold',
            },
         
          },
        },
      },
    };
  
    tags = Object.entries(dt_wordResults).map(([value, count]) => ({ value, count }));
  }
  



const customRenderer = (tag, size) => {
  let tagColor = '#5486b4'; 
  if (tag.value.startsWith('@')) {
    tagColor = '#85B1D4'; 
  } else if (tag.value.startsWith('#')) {
    tagColor = '#C1DBD1';
  } else {
    tagColor = '#C9A5B6'; 
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
      }}>
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
    <li className="list-group-item border-black" style ={{fontSize:'18px'}}>Number of tweets: <span style= { { fontWeight:'bold', fontSize:'25px'}}>{dt_results.length}</span></li>
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
              offset={30} position="insideBottom"
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

export default PmdMonitor;
