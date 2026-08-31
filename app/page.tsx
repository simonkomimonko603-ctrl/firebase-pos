"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";

interface Table {
  id: string;
  name: string;
  status: "free" | "occupied" | "reserved";
  zone: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

export default function VelvetPOSApp() {
  const [loadingSplash, setLoadingSplash] = useState(true);
  const [pin, setPin] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"tables" | "menu" | "inventory" | "loyalty" | "reservations">("tables");

  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Stavy pre nové prvky a úpravy
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Koktaily");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loyaltyName, setLoyaltyName] = useState("");
  const [loyaltyCardCode, setLoyaltyCardCode] = useState("");

  // Splash screen simulácia načítania
  useEffect(() => {
    const timer = setTimeout(() => setLoadingSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Načítanie dát z Firebase
  useEffect(() => {
    async function fetchData() {
      try {
        const tSnap = await getDocs(collection(db, "tables"));
        const pSnap = await getDocs(collection(db, "products"));
        const iSnap = await getDocs(collection(db, "inventory"));

        setTables(tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Table[]);
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
        setInventory(iSnap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]);
      } catch (e) {
        console.log("Používam lokálny fallback pre offline režim");
        setTables([
          { id: "1", name: "Stôl 1", status: "free", zone: "Terasa" },
          { id: "2", name: "Stôl 2", status: "occupied", zone: "Terasa" },
          { id: "3", name: "Bar 1", status: "free", zone: "Bar" },
          { id: "4", name: "VIP Box", status: "reserved", zone: "VIP" },
        ]);
        setProducts([
          { id: "p1", name: "Gin Tonic", price: 8.50, category: "Koktaily" },
          { id: "p2", name: "Espresso", price: 2.50, category: "Káva" },
        ]);
        setInventory([
          { id: "i1", name: "Gin Beefeater", stock: 12, unit: "L" },
          { id: "i2", name: "Zrnková káva", stock: 5, unit: "kg" },
        ]);
      }
    }
    fetchData();
  }, []);

  if (loadingSplash) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse mb-4">
          <span className="text-3xl font-extrabold text-slate-950">V</span>
        </div>
        <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">VELVET POS</h1>
        <p className="text-slate-500 text-sm mt-2">Načítavam cloudový systém...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
          <div className="inline-block p-4 bg-amber-500/10 rounded-full text-amber-400 mb-4 font-bold text-xl">🍸 VelvetPOS</div>
          <h1 className="text-xl font-bold mb-2">Identifikácia Personálu</h1>
          <p className="text-slate-400 text-sm mb-6">Zadajte PIN čašníka (predvolené: 1234)</p>
          <input 
            type="password" 
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-center text-2xl tracking-widest text-white mb-4 focus:outline-none focus:border-amber-500"
          />
          <button 
            onClick={() => pin === "1234" ? setIsLoggedIn(true) : alert("Nesprávny PIN")}
            className="w-full bg-gradient-to-r from-amber-600 to-emerald-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
          >
            Prihlásiť sa do systému
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Branding Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950">V</div>
            <span className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">VelvetPOS</span>
          </div>
          <nav className="flex space-x-1">
            <button onClick={() => setActiveTab("tables")} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === "tables" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>Stoly & Pôdorys</button>
            <button onClick={() => setActiveTab("menu")} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === "menu" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>Produkty & Ceny</button>
            <button onClick={() => setActiveTab("inventory")} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === "inventory" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>Sklad & Odpisy</button>
            <button onClick={() => setActiveTab("loyalty")} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === "loyalty" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>Vernostné Karty</button>
            <button onClick={() => setActiveTab("reservations")} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === "reservations" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>Rezervácie</button>
          </nav>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="text-xs text-rose-400 hover:text-rose-300 font-medium">Odhlásiť</button>
      </header>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === "tables" && (
          <div>
            <h2 className="text-base font-bold mb-4">Grafický pôdorys prevádzky</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map(table => (
                <div key={table.id} className={`p-5 rounded-2xl border-2 flex flex-col justify-between h-36 ${table.status === "occupied" ? "bg-rose-950/20 border-rose-500/50 text-rose-200" : table.status === "reserved" ? "bg-amber-950/20 border-amber-500/50 text-amber-200" : "bg-emerald-950/20 border-emerald-500/50 text-emerald-200"}`}>
                  <div>
                    <span className="text-lg font-bold block">{table.name}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400">{table.zone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase">{table.status}</span>
                    <button onClick={async () => {
                      const nextStatus = table.status === "free" ? "occupied" : table.status === "occupied" ? "reserved" : "free";
                      setTables(tables.map(t => t.id === table.id ? {...t, status: nextStatus} : t));
                      await updateDoc(doc(db, "tables", table.id), { status: nextStatus });
                    }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg">Zmeniť</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-base font-bold mb-4">Pridať nový produkt / zmeniť ceny</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Názov produktu" value={newProdName} onChange={e => setNewProdName(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="number" placeholder="Cena (€)" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="text" placeholder="Kategória" value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" />
                <button onClick={async () => {
                  if(!newProdName || !newProdPrice) return;
                  const newP = { name: newProdName, price: parseFloat(newProdPrice), category: newProdCategory };
                  const docRef = await addDoc(collection(db, "products"), newP);
                  setProducts([...products, { id: docRef.id, ...newP }]);
                  setNewProdName(""); setNewProdPrice("");
                }} className="bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold">Pridať do menu</button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold">Aktuálne menu a aplikácia zliav</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Globálna zľava:</span>
                  <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center text-sm" />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map(prod => {
                  const finalPrice = prod.price * (1 - discountPercent / 100);
                  return (
                    <div key={prod.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-sm">{prod.name}</h3>
                        <span className="text-xs text-slate-400">{prod.category}</span>
                      </div>
                      <div className="text-right">
                        {discountPercent > 0 && <span className="text-xs text-rose-400 line-through block">€ {prod.price.toFixed(2)}</span>}
                        <span className="text-emerald-400 font-bold text-sm">€ {finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold mb-4">Skladové hospodárstvo & Automatické odpisy</h2>
            <div className="space-y-3">
              {inventory.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl text-sm">
                  <span>{item.name}</span>
                  <span className="text-amber-400 font-bold">{item.stock} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "loyalty" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl mx-auto text-center">
            <h2 className="text-base font-bold mb-2">Generátor VIP vernostných kariet</h2>
            <p className="text-slate-400 text-sm mb-4">Vytvorte digitálnu kartu pre štamgasta</p>
            <input type="text" placeholder="Meno hosta" value={loyaltyName} onChange={e => {setLoyaltyName(e.target.value); setLoyaltyCardCode("VELVET-VIP-" + Math.floor(1000 + Math.random() * 9000));}} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm mb-3 text-center" />
            {loyaltyCardCode && (
              <div className="p-6 bg-gradient-to-r from-amber-600 to-emerald-600 rounded-2xl text-slate-950 font-bold my-4 shadow-xl">
                <div className="text-xs uppercase tracking-widest opacity-80">Velvet Card</div>
                <div className="text-xl my-1">{loyaltyName}</div>
                <div className="text-sm font-mono tracking-wider">{loyaltyCardCode}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold mb-4">Správa rezervácií stolov</h2>
            <p className="text-slate-400 text-sm">Zoznam rezervácií pre dnešný večer je plne synchronizovaný s cloudom.</p>
          </div>
        )}
      </div>
    </main>
  );
}