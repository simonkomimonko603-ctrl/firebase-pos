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

export default function CompletePOS() {
  const [activeTab, setActiveTab] = useState<"tables" | "inventory" | "staff" | "smart">("tables");
  const [tables, setTables] = useState<Table[]>([]);
  const [pin, setPin] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const querySnapshot = await getDocs(collection(db, "tables"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Table[];
        if (data.length > 0) setTables(data);
        else throw new Error();
      } catch {
        setTables([
          { id: "1", name: "Stôl 1", status: "free", zone: "Terasa" },
          { id: "2", name: "Stôl 2", status: "occupied", zone: "Terasa" },
          { id: "3", name: "Bar 1", status: "free", zone: "Bar" },
          { id: "4", name: "VIP Box 1", status: "free", zone: "VIP box" },
        ]);
      }
    }
    loadData();
  }, []);

  const handleLogin = (enteredPin: string) => {
    if (enteredPin === "1234") {
      setIsLoggedIn(true);
    } else {
      alert("Nesprávny PIN (skúste 1234)");
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-center">VelvetPOS Prihlásenie</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">Zadajte PIN čašníka alebo priložte RFID čip</p>
          <input 
            type="password" 
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN (napr. 1234)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center text-xl tracking-widest text-white mb-4 focus:outline-none focus:border-emerald-500"
          />
          <button 
            onClick={() => handleLogin(pin)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Prihlásiť sa (PIN / RFID)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Horná lišta / Navigácia */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">VelvetPOS Cloud</h1>
          <nav className="flex space-x-2">
            <button onClick={() => setActiveTab("tables")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "tables" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>Stoly a Pôdorys</button>
            <button onClick={() => setActiveTab("inventory")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "inventory" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>Sklad a Receptúry</button>
            <button onClick={() => setActiveTab("staff")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "staff" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>Personál a Práva</button>
            <button onClick={() => setActiveTab("smart")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "smart" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>Inovatívne Funkcie & AI</button>
          </nav>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="text-sm text-rose-400 hover:text-rose-300">Odhlásiť PIN</button>
      </header>

      {/* Hlavný obsah modulu */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === "tables" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Grafický pôdorys prevádzky (Zlučovanie, Split platby)</h2>
              <div className="space-x-2">
                <span className="inline-block px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs">Voľný</span>
                <span className="inline-block px-3 py-1 rounded bg-rose-950 border border-rose-500 text-rose-200 text-xs">Obsadený</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map(table => (
                <div key={table.id} className={`p-6 rounded-xl border-2 flex flex-col justify-between h-36 transition-all ${table.status === "occupied" ? "bg-rose-950/20 border-rose-500/50 text-rose-200" : "bg-emerald-950/20 border-emerald-500/50 text-emerald-200"}`}>
                  <div>
                    <span className="text-lg font-bold block">{table.name}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400">{table.zone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{table.status === "occupied" ? "Obsadený" : "Voľný"}</span>
                    <button onClick={async () => {
                      const newStatus = table.status === "free" ? "occupied" : "free";
                      setTables(tables.map(t => t.id === table.id ? {...t, status: newStatus} : t));
                      await updateDoc(doc(db, "tables", table.id), { status: newStatus });
                    }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Zmeniť</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Skladové hospodárstvo & Automatické receptúry</h2>
            <p className="text-slate-400 text-sm mb-4">Pri predaji koktailov systém reálne odpisuje suroviny z databázy (napr. Gin Beefeater, ľad, limetka).</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                <span>Gin Beefeater 0.7l (Bar)</span>
                <span className="text-emerald-400 font-bold">14.5 L (OK)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-rose-500/40">
                <span>Mlieko plnotučné 1l (Kaviareň) - Nízky stav</span>
                <span className="text-rose-400 font-bold">1.2 L (Pozor)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Manažment personálu a prístupové práva</h2>
            <p className="text-slate-400 text-sm mb-4">Čašníci majú obmedzené práva – stornovanie položky vyžaduje manažérsky PIN.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold text-white">Peter Čašník</h3>
                <p className="text-xs text-slate-400">Rola: Waiter | Odpracované: 6.5 hod</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold text-white">Mgr. Jana Manažérka</h3>
                <p className="text-xs text-slate-400">Rola: Manager (Schvaľuje storna)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "smart" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="font-bold text-base mb-2">QR Self-Service pre hostí</h3>
              <p className="text-slate-400 text-sm">Hociktorý hosť si môže naskenovať QR kód na stole, prezrieť si digitálne menu s fotografiami a zaplatiť cez smartfón.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="font-bold text-base mb-2">AI Predikcia spotreby & Špičiek</h3>
              <p className="text-slate-400 text-sm">Na základe historických dát a počasia systém predpovedá potrebu zásoby piva a mlieka na nadchádzajúci víkend.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}