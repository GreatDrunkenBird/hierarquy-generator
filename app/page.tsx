'use client';

import './globals.css';
import React, { useState } from 'react';
import { FaPlus, FaMinus, FaTrashAlt, FaDownload } from 'react-icons/fa';

type Hierarchy = {
  [key: string]: Hierarchy | string[];
};

const HierarchyBuilder: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isValue, setIsValue] = useState<boolean>(false);

  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  const toggleNode = (node: string) => {
    setExpandedNodes(prev =>
      prev.includes(node) ? prev.filter(n => n !== node) : [...prev, node]
    );
  };

  const addCategory = (path: string[], categoryName: string) => {
    if (!categoryName) return;
  
    let updatedHierarchy = deepClone(hierarchy);
    let current = updatedHierarchy;
  
    // Traverse the hierarchy based on the provided path
    for (const p of path) {
      if (current[p] && typeof current[p] === "object") {
        current = current[p] as Hierarchy;
      }
    }
  
    if (isValue) {
      // Ensure the target is an array where the value should be added
      const lastPath = path[path.length - 1];
      if (!Array.isArray(current[lastPath])) {
        current[lastPath] = [];
      }
      (current[lastPath] as string[]).push(categoryName);
    } else {
      // Ensure the target is an object where the subcategory should be added
      const lastPath = path[path.length - 1];
      if (typeof current[lastPath] === "object" && !Array.isArray(current[lastPath])) {
        // If the last path is an object, add the new subcategory to it
        current[lastPath][categoryName] = {};
      } else {
        // Otherwise, create a new subcategory at the current level
        current[categoryName] = {};
      }
    }
  
    setHierarchy(updatedHierarchy);
    setAddingCategory(null);
    setNewCategoryName("");
    setIsValue(false);
  };
  

  const removeCategory = (path: string[]) => {
    let updatedHierarchy = deepClone(hierarchy);
    let current = updatedHierarchy;

    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] && typeof current[path[i]] === 'object') {
        current = current[path[i]] as Hierarchy;
      }
    }

    const lastKey = path[path.length - 1];
    if (Array.isArray(current)) {
      current.splice(parseInt(lastKey), 1);
    } else {
      delete current[lastKey];
    }

    setHierarchy(updatedHierarchy);
  };

  const renderHierarchy = (obj: Hierarchy | string[], currentPath: string[] = []) => {
    if (Array.isArray(obj)) {
      return (
        <ul className="pl-4 list-disc text-sm">
          {obj.map((item, index) => (
            <li key={index} className="flex items-center space-x-2 py-2">
              <span>{item}</span>
              <button
                className="text-red-500 hover:text-red-700 flex items-center p-1 rounded transition duration-200 hover:bg-red-100"
                onClick={() => removeCategory([...currentPath, index.toString()])}
              >
                <FaTrashAlt className="mr-1" />
                Remover
              </button>
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <ul className="pl-4">
          {Object.entries(obj).map(([key, value]) => (
            <li key={key} className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md transition duration-200 hover:shadow-lg">
              <div className="flex items-center space-x-2">
                <button
                  className="text-lg text-gray-500 hover:text-gray-700 flex items-center p-1 transition duration-200 hover:bg-gray-200 rounded-full"
                  onClick={() => toggleNode(key)}
                >
                  {expandedNodes.includes(key) ? <FaMinus /> : <FaPlus />}
                </button>
                <span className="font-bold text-lg">{key}</span>
                <button
                  className="ml-4 text-red-500 hover:text-red-700 flex items-center p-1 rounded transition duration-200 hover:bg-red-100"
                  onClick={() => removeCategory([...currentPath, key])}
                >
                  <FaTrashAlt className="mr-1" />
                  Remover
                </button>
              </div>
              {expandedNodes.includes(key) && (
                <>
                  {renderHierarchy(value as Hierarchy, [...currentPath, key])}
                  {!addingCategory && typeof value === 'object' && !Array.isArray(value) && (
                    <li className="ml-6 mt-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center p-2 rounded-lg bg-blue-50 transition duration-200 hover:bg-blue-100"
                        onClick={() => setAddingCategory([...currentPath, key].join("/"))}
                      >
                        <FaPlus className="mr-1" />
                        Adicionar
                      </button>
                    </li>
                  )}
                  {addingCategory === [...currentPath, key].join("/") && (
                    <div className="mt-2 p-4 border border-gray-800 rounded-lg bg-white shadow-md transition duration-200 hover:shadow-lg">
                      <div className="flex space-x-2 mb-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value="value"
                            checked={isValue}
                            onChange={() => setIsValue(true)}
                            className="mr-2"
                          />
                          Valor
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value="category"
                            checked={!isValue}
                            onChange={() => setIsValue(false)}
                            className="mr-2"
                          />
                          Subcategoria
                        </label>
                      </div>
                      <input
                        type="text"
                        className="border rounded p-2 mb-2 w-full"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={isValue ? "Novo Valor" : "Nova Subcategoria"}
                      />
                      <div className="flex space-x-2">
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                          onClick={() => addCategory([...currentPath, key], newCategoryName)}
                        >
                          Salvar
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                          onClick={() => setAddingCategory(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      );
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(hierarchy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hierarchy.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Construtor de Hierarquia</h1>
      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Visualizar Hierarquia</h2>
        {Object.keys(hierarchy).length > 0 ? (
          <>
            {renderHierarchy(hierarchy)}
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
              onClick={downloadJSON}
            >
              <FaDownload className="mr-2" />
              Baixar JSON
            </button>
          </>
        ) : (
          <div>
            <p className="mb-4">Nenhuma categoria criada ainda.</p>
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setAddingCategory("root")}
            >
              Adicionar Categoria Principal
            </button>
            {addingCategory === "root" && (
              <div className="mt-2">
                <div className="flex space-x-2 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="value"
                      checked={isValue}
                      onChange={() => setIsValue(true)}
                      className="mr-2"
                    />
                    Valor
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="category"
                      checked={!isValue}
                      onChange={() => setIsValue(false)}
                      className="mr-2"
                    />
                    Categoria
                  </label>
                </div>
                <input
                  type="text"
                  className="border rounded p-2 mb-2 w-full"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={isValue ? "Novo Valor" : "Nova Categoria"}
                />
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                    onClick={() => addCategory([], newCategoryName)}
                  >
                    Salvar
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    onClick={() => setAddingCategory(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyBuilder;

