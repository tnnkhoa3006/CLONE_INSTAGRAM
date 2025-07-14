import React, { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchPanel = forwardRef(({ searchResults = [], onSearch }, ref) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div
      ref={ref}
      className="fixed left-[80px] top-0 h-full w-[350px] bg-black rounded-none z-50 overflow-y-auto animate-slideInPanel"
      style={{ minHeight: "100vh" }}
    >
      <div className="p-4 font-bold text-lg text-white">Search</div>
      <div className="px-4 pb-2">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search users, posts..."
          className="w-full px-3 py-2 rounded bg-zinc-800 text-white outline-none"
        />
      </div>
      <div>
        {searchResults.length > 0 ? (
          searchResults.map((result, idx) => (
            <div
              key={result._id || idx}
              className="flex items-center px-4 py-3 hover:bg-zinc-800 transition cursor-pointer"
              onClick={() => navigate(`/profile/${result._id}`)}
            >
              <img
                src={result.ProfilePicture}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <span className="font-semibold text-white">{result.username}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-400 text-center">No results</div>
        )}
      </div>
    </div>
  );
});

export default SearchPanel;
