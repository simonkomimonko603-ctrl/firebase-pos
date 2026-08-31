// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

interface Table {
  id: string;
  name: string;
  status: "free" | "occupied";
  zone: string;
}

export default function POSDashboard() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    async function fetchTables() {
      try {
        const querySnapshot = await getDocs(collection(db, "tables"));
        const tablesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Table[];
        
        if (tablesData.length === 0) {
          setTables([
            { id: "1", name: "Stôl 1", status: "free", zone: "Terasa" },
            { id: "2", name: "Stôl 2", status: "occupied", zone: "Terasa" },
            { id: "3", name: "Bar 1", status: "free", zone: "Bar" },
          ]);
        } else {
          setTables(tablesData);
        }
      } catch (e) {
        // Fallback pre lokálny test ak Firebase ešte nemá dáta/kolekciu
        setTables([
          { id: "1", name: "Stôl 1", status: "free", zone: "Terasa" },
          { id: "2", name: "Stôl 2", status: "occupied", zone: "Terasa" },
          { id: "3", name: "Bar 1", status: "free", zone: "Bar" },
        ]);
      }
    }
    fetchTables();
  }, []);

  const toggleTableStatus = async (table: Table) => {
    const newStatus = table.status === "free" ? "occupied" : "free";
    setTables(tables.map(t => t.id === table.id ? { ...t, status: newStatus } : t));
    
    try {
      await updateDoc(doc(db, "tables", table.id), { status: newStatus });
    } catch (e) {
      console.log("Firebase sync offline / demo mode");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Cloud POS – Správa Stolov</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => toggleTableStatus(table)}
            className={`p-6 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-between h-36 ${
              table.status === "occupied" 
                ? "bg-rose-950/40 border-rose-500 text-rose-200" 
                : "bg-emerald-950/40 border-emerald-500 text-emerald-200"
            }`}
          >
            <span className="text-lg font-semibold">{table.name}</span>
            <div>
              <span className="text-xs uppercase tracking-wider block opacity-75">{table.zone}</span>
              <span className="text-sm font-bold mt-1 block">
                {table.status === "occupied" ? "Obsadený" : "Voľný"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}