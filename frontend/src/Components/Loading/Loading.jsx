import React from "react";

const Loading = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-white shadow-md overflow-hidden animate-pulse"
          style={{ height: "440px" }}
        >
          <div className="bg-gray-200 h-40 w-full" style={{ height: "300px" }}></div>
          <div className="p-4 bg-[#f5efe9]">
            <div className="bg-gray-200 h-5 w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;
