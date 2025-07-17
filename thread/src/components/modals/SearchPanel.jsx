import React, { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SearchPanel = forwardRef(({ searchResults = [], onSearch, onClose }, ref) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 md:left-[80px] h-full w-full md:w-[350px] bg-black z-50 overflow-y-auto animate-slideInPanel"
      style={{ minHeight: "100vh" }}
    >
      {/* Header với nút back */}
      <div className="flex items-center p-4 font-bold text-lg text-white">
        <button className="md:hidden mr-4" onClick={() => onClose && onClose()}>
          <ArrowBackIcon style={{ color: "#fff" }} />
        </button>
        Search
      </div>

      {/* Ô nhập tìm kiếm */}
      <div className="px-4 pb-2">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search users, posts..."
          className="w-full px-3 py-2 rounded bg-zinc-800 text-white outline-none"
        />
      </div>

      {/* Kết quả tìm kiếm */}
      <div>
        {searchResults.length > 0 ? (
          searchResults.filter(Boolean).map((result, idx) => (
            <div
              key={result._id || idx}
              className="flex items-center px-4 py-3 hover:bg-zinc-800 transition cursor-pointer"
              onClick={() => {
                navigate(`/profile/${result._id}`);
                if (onClose) onClose(); // đóng panel sau khi click
              }}
            >
              <img
                src={result.ProfilePicture}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="flex-1 text-sm">
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
