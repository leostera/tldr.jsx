import React from 'react';

export default React.createClass({
  render: function () {
    return (
      <div className="empty-results">
        <h3>No results</h3>
        <blockquote>
          <p>Try searching something like <i>cd</i></p>
        </blockquote>
      </div>
    );
  },

});
