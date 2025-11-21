import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex items-center w-full rounded-full bg-white border border-gray-300 px-4 py-2 shadow-sm">
      <Search className="w-5 h-5 text-gray-400 mr-2" />
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-gray-700"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchBar;