const Consistency = () => {
    // Updated to represent a year's worth of weekly data (52 weeks)
    const activityData = Array(52 * 7).fill(false).map((_, index) => index % 7 === 0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
    return (
      <div className="activity-grid">
        <h3>Activity</h3>
  
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Days Header (Vertical) */}
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
            {daysOfWeek.map((day, index) => (
              <div key={index} style={{ height: '20px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
                {day}
              </div>
            ))}
          </div>
  
          {/* Activity Grid (Vertical) */}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {Array.from({ length: 52 }, (_, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column' }}>
                {daysOfWeek.map((_, dayIndex) => {
                  const cellIndex = weekIndex * 7 + dayIndex;
                  return (
                    <div
                      key={cellIndex}
                      className={`grid-cell ${activityData[cellIndex] ? 'active' : ''}`}
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '1px solid #ccc',
                        backgroundColor: activityData[cellIndex] ? '#4caf50' : '#e0e0e0',
                      }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default Consistency;
  