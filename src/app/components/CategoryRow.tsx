"use client";

import React from "react";

interface Props {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryRow({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors duration-200 focus:outline-none ${
            selected === cat
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
