import React from 'react';

const Tooltip = ({ children, content }) => {
  return (
    <div className="relative inline-block">
      {children}
      <span className="absolute z-10 hidden w-32 p-2 text-white bg-black rounded-lg tooltip-text bottom-full left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {content}
      </span>
    </div>
  );
};

export default Tooltip; 