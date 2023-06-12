import React from 'react'
import {  Link} from 'react-router-dom'
const HomeBody = () => {
  return (
    <div className="container-fluid" style={{ backgroundColor: '#536890', borderRadius: '10px', overflow: 'hidden', minHeight: '500px',height:'auto',margin: '0 auto 50px auto', maxWidth: '1200px'}}>
    <div className="row">
      <div className="col">
        <div className="card border-0" style={{backgroundColor: '#536890'}}>
          <div className="card-body d-flex flex-column justify-content-center align-items-center">
            <h2 className="card-title mb-5" style={{ color: 'white', textAlign: 'center' }}>Welcome to our cutting-edge platform for Influencer Sentiment Analysis on Twitter!</h2>
            <div className="card-text" style={{ color: 'white' }}>
 


<p className="mb-1">Are you curious about what people really think about your favorite influencers?
Look no further, as our innovative website is designed to provide you with deep insights into
the sentiment surrounding influencers in real-time.Harnessing the power of natural language processing and machine learning,
our platform analyzes millions of tweets to determine the sentiment expressed towards influencers. Whether you're a brand looking to collaborate
with influencers or an individual seeking to understand public opinion, our site offers a comprehensive and user-friendly solution.</p>
<br/>

 

<p className="mb-1">Discover the sentiment behind every tweet, comment, and mention.
Our advanced algorithms process textual data, taking into account the context, tone, and emotional nuances to gauge the sentiment accurately. 
We provide you with in-depth sentiment analysis reports, highlighting positive, negative, and neutral sentiments towards influencers.
Stay up-to-date with the latest trends and opinions in the influencer world.
Our real-time monitoring system continuously tracks Twitter, ensuring you have access to the freshest data.
Whether you're interested in popular influencers, rising stars, or specific niches, our platform offers a vast database to explore.</p>
<br/>



<p className="mb-1">Gain valuable insights and make informed decisions. 
Our comprehensive analytics tools allow you to dive deeper into the sentiment analysis results. 
Identify influential influencers, track sentiment over time, and compare sentiment across different platforms.
Uncover patterns, trends, and correlations to guide your marketing strategies or personal choices.We prioritize user experience and accessibility,
making our website intuitive and easy to navigate. Whether you're a social media enthusiast, marketer, researcher, or simply a curious individual, 
our platform provides a seamless and enriching experience.Join us on this exciting journey into the world of influencer sentiment analysis. 
Start exploring our website today and unlock a wealth of information that will transform 
the way you perceive and engage with influencers on Twitter.</p>
<br/>



</div>
            <div className="mt-4">
              <Link className="btn custom-btn btn-primary btn-lg me-3" to={`/twitter`}>To Twitter</Link>
              <Link className="btn custom-btn btn-primary btn-lg" to={`/pmd`}>To Sentiment 140 Dataset</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  )
}

export default HomeBody