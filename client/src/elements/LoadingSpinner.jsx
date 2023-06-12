import React from 'react';

class LoadingSpinner extends React.Component {
  render() {
    const { loadingTextUrl } = this.props;

    return (
      <div className="loading-container" >
        <img
          src={[loadingTextUrl]}
          alt="Loading"
          className="img-fluid"
        />
      </div>
    );
  }
}

export default LoadingSpinner;
