import React, { useState, useEffect } from "react";

// Função utilitária para normalizar strings (corrigir pesquisa)
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

export default function App() {
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");
  const [allSheets, setAllSheets] = useState([]);

  // Carregar o JSON na montagem
  useEffect(() => {
    fetch("/resultado_final.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setAllSheets(Object.keys(json));
        setSelectedSheet(Object.keys(json)[0] || "");
        setFilteredData(json[Object.keys(json)[0]] || []);
      });
  }, []);

  // Função de pesquisa
  const handleSearch = () => {
    if (!selectedSheet) return;

    const sheetData = data[selectedSheet] || [];

    const results = sheetData.filter((row) => {
      let matchName = true;
      let matchCpf = true;

      if (searchName) {
        const nameInRow = normalizeText(
          Object.values(row).join(" ") // procura em todas as colunas
        );
        matchName = nameInRow.includes(normalizeText(searchName));
      }

      if (searchCpf) {
        const cpfInRow = Object.values(row).join(" ");
        matchCpf = cpfInRow.includes(searchCpf.trim());
      }

      return matchName && matchCpf;
    });

    setFilteredData(results);
  };

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🔎 Consulta de Registros</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Nome:</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Digite o nome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">CPF:</label>
          <input
            type="text"
            value={searchCpf}
            onChange={(e) => setSearchCpf(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Digite o CPF"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Planilha:</label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {allSheets.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Pesquisar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white p-4 rounded shadow overflow-auto">
        {filteredData.length === 0 ? (
          <p className="text-gray-500">Nenhum resultado encontrado.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr>
                {Object.keys(filteredData[0]).map((col, i) => (
                  <th key={i} className="border px-2 py-1 bg-gray-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-2 py-1">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
