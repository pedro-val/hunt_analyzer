"use client";

interface HuntingGround {
  pid: string;
  name: string;
  description: string;
}

interface HuntingGroundSelectorProps {
  huntingGrounds: HuntingGround[];
  selectedHuntingGround: string;
  setSelectedHuntingGround: (pid: string) => void;
  huntingGroundSearch: string;
  setHuntingGroundSearch: (search: string) => void;
}

export function HuntingGroundSelector({
  huntingGrounds,
  selectedHuntingGround,
  setSelectedHuntingGround,
  huntingGroundSearch,
  setHuntingGroundSearch
}: HuntingGroundSelectorProps) {
  
  const filteredHuntingGrounds = huntingGrounds.filter(ground =>
    ground.name.toLowerCase().includes(huntingGroundSearch.toLowerCase())
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
      <input
        type="text"
        value={huntingGroundSearch}
        onChange={(e) => setHuntingGroundSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Procurar hunting ground..."
      />
      <select
        value={selectedHuntingGround}
        onChange={(e) => setSelectedHuntingGround(e.target.value)}
        className="w-full p-2 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
        size={20}
      >
        <option value="">Selecione um hunting ground</option>
        {filteredHuntingGrounds.map((ground) => (
          <option key={ground.pid} value={ground.pid}>
            {ground.name}
          </option>
        ))}
      </select>
    </div>
  );
}