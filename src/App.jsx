import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Maximize, Lightbulb, Settings, ChevronLeft, Camera, Save, Image as ImageIcon, Phone, User, Mail, Bed, ExternalLink, Calendar, LogOut, Lock, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
// Detectamos si estamos en el entorno local de tu ordenador (donde aún no hay llaves)
const isLocalDev = typeof __firebase_config === 'undefined';
const firebaseConfig = isLocalDev ? { apiKey: "demo", projectId: "demo", appId: "demo" } : JSON.parse(__firebase_config);

const app = initializeApp(firebaseConfig);
// Solo intentamos conectar si NO estamos en local
const auth = isLocalDev ? null : getAuth(app);
const db = isLocalDev ? null : getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- DATOS INICIALES ---
const initialUsers = [
  { id: 'admin', role: 'admin', name: 'Superadministrador' },
  { id: 'pepeluna', role: 'company', name: 'Pepe Luna (España - Canarias)' },
  { id: 'veronica', role: 'company', name: 'Veronica (Argentina)' },
  { id: 'lacanica', role: 'company', name: 'La Canica (España - Madrid)' },
  { id: 'jordibertran', role: 'company', name: 'Jordi Bertran (España - Cataluña)' },
  { id: 'trukitrek', role: 'company', name: 'Truki Trek (Italia)' },
  { id: 'robertowhite', role: 'company', name: 'Roberto White (Argentina)' },
  { id: 'pablosaez', role: 'company', name: 'Pablo Sáez (Brasil)' },
  { id: 'echeide', role: 'company', name: 'Echeide.com (Talleres)' }
];

const accommodationsList = [
  { id: 'h1', name: 'Hotel Ventor', url: 'https://maps.app.goo.gl/1y7P9wELYCzuLc8E9' },
  { id: 'h2', name: 'Alojamiento Opción 2', url: 'https://maps.app.goo.gl/hdkeAaZZdExJLeMM7' },
  { id: 'h3', name: 'Alojamiento Opción 3', url: 'https://maps.app.goo.gl/qqv7ftpFdzPzr53z7' }
];

const initialAssignments = [
  { id: 101, companyId: 'pepeluna', locationId: 17, date: '2026-04-17', time: '19:30', accommodationId: 'h1' },
  { id: 102, companyId: 'pepeluna', locationId: 3, date: '2026-04-19', time: '17:30', accommodationId: 'h1' },
  { id: 103, companyId: 'pepeluna', locationId: 18, date: '2026-04-23', time: '18:00', accommodationId: 'h1' },
  { id: 104, companyId: 'pepeluna', locationId: 11, date: '2026-04-24', time: '18:00', accommodationId: 'h1' },
  { id: 105, companyId: 'pepeluna', locationId: 20, date: '2026-04-24', time: '10:30', accommodationId: 'h1' },
  { id: 106, companyId: 'pepeluna', locationId: 20, date: '2026-04-25', time: '13:15', accommodationId: 'h1' },
  { id: 201, companyId: 'veronica', locationId: 17, date: '2026-04-18', time: '10:30', accommodationId: 'h2' },
  { id: 202, companyId: 'veronica', locationId: 11, date: '2026-04-21', time: '18:00', accommodationId: 'h2' },
  { id: 301, companyId: 'lacanica', locationId: 6, date: '2026-04-17', time: '11:00', accommodationId: 'h3' },
  { id: 401, companyId: 'jordibertran', locationId: 17, date: '2026-04-18', time: '17:00', accommodationId: 'h1' },
  { id: 501, companyId: 'trukitrek', locationId: 3, date: '2026-04-18', time: '17:30', accommodationId: 'h2' },
  { id: 601, companyId: 'robertowhite', locationId: 17, date: '2026-04-17', time: '17:30', accommodationId: 'h3' },
  { id: 701, companyId: 'pablosaez', locationId: 19, date: '2026-04-18', time: '18:30', accommodationId: 'h1' },
  { id: 801, companyId: 'echeide', locationId: 23, date: '2026-04-24', time: '20:00', accommodationId: 'h2' }
];

const initialLocations = [
  { id: 1, name: 'Centro Cultural de Alcalá', municipality: 'Guía de Isora', address: 'C. Mondiola, 18, 38686 Alcalá' },
  { id: 2, name: 'Centro Cultural Playa San Juan', municipality: 'Guía de Isora', address: 'Av. Emigrante, 910, 38687 Guía de Isora' },
  { id: 3, name: 'Centro social Tamaimo', municipality: 'Santiago del Teide', address: 'C. Méndez Núñez, 29, 38684 Tamaimo' },
  { id: 4, name: 'Convento de Santo Domingo', municipality: 'San Cristobal de La Laguna', address: 'C. Santo Domingo, 7, 38207 La Laguna' },
  { id: 5, name: 'Espacio Cultural Cine Viejo', municipality: 'Candelaria', address: 'C/ Los Príncipes, 2. Candelaria' },
  { id: 6, name: 'Plaza Nuestra Señora de La Luz (Auditorio)', municipality: 'Guía de Isora', address: 'Calle Ayuntamiento, 6, 38680 Guía de Isora' },
  { id: 8, name: 'Centro Social Palo Blanco (Biblioteca)', municipality: 'Los Realejos', address: 'C. Palo Blanco, 66, 38415 Palo Blanco' },
  { id: 9, name: 'Casino Cruz Santa', municipality: 'Los Realejos', address: 'C.Real de la Cruz Santa, 70, 38413 Los Realejos' },
  { id: 11, name: 'Centro Cultural Icod El Alto', municipality: 'Los Realejos', address: 'Cam. Real, 14, 38414 Los Realejos' },
  { id: 13, name: 'Asoc. de vecinos La Carrera', municipality: 'Los Realejos', address: 'Cam. la Palma, 3, 38419 Los Realejos' },
  { id: 14, name: 'Centro Cultural La Ferruja', municipality: 'Los Realejos', address: 'Camino la Ferruja, 23B, 38413 Los Realejos' },
  { id: 15, name: 'Asoc. de vecinos San Cayetano, La Montaña', municipality: 'Los Realejos', address: '38419 La Montañeta' },
  { id: 16, name: 'Biblioteca de Las Llanadas', municipality: 'Los Realejos', address: 'Las Llanadas, 33, 38413 Los Realejos' },
  { id: 17, name: 'Parque de la Parra. Auditorio', municipality: 'Los Realejos', address: 'Calle los Principes, 1, 38412 Los Realejos' },
  { id: 18, name: 'Asoc. de vecinos Tulipán, La Zamora', municipality: 'Los Realejos', address: 'Placita La Zamora, 38419 Los Realejos' },
  { id: 19, name: 'Plaza de la Concepción', municipality: 'Los Realejos', address: '38419 Los Realejos' },
  { id: 20, name: 'Plaza del Adelantado', municipality: 'San Cristobal de La Laguna', address: 'Plaza del adelantado, 38201 La Laguna' },
  { id: 22, name: 'Auditorio de El Sauzal', municipality: 'El Sauzal', address: 'C. la Constitución, 3, 38360 El Sauzal' },
  { id: 23, name: 'Teatro Cine Realejos', municipality: 'Los Realejos', address: 'C/ San Agustín, 59, 38410 Los Realejos' },
  { id: 24, name: 'Teatro Príncipe Felipe', municipality: 'Tegueste', address: 'C. El Casino, 7, 38280 Tegueste' },
  { id: 25, name: 'Asoc. de vecinos La Barca Toscal-longuera', municipality: 'Los Realejos', address: 'C. Taburiente, 1, 38418 Los Realejos' }
].map(loc => ({
  ...loc,
  generalContactName: '', generalContactPhone: '', generalContactEmail: '',
  roomContactName: '', roomContactPhone: '', roomContactEmail: '',
  capacity: '', width: '', depth: '', height: '', techSpecs: '', lighting: '', notes: '', photos: []
}));

// --- APP PRINCIPAL ---
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [locations, setLocations] = useState(initialLocations);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [loading, setLoading] = useState(true);

  // 1. Inicializar Firebase Auth de forma segura
  useEffect(() => {
    if (isLocalDev) {
      setFirebaseUser({ uid: 'usuario-local' });
      setIsAuthReady(true);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error en auth:", error);
      } finally {
        setIsAuthReady(true);
      }
    };
    initAuth();
    
    const unsubscribe = auth ? onAuthStateChanged(auth, setFirebaseUser) : () => {};
    return () => unsubscribe();
  }, []);

  // 2. Cargar/Sincronizar datos de Firestore
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    if (isLocalDev) {
      // En tu ordenador saltamos la carga de Firestore y mostramos los datos estáticos
      setLoading(false);
      return;
    }

    const locationsRef = collection(db, 'artifacts', appId, 'public', 'data', 'locations');
    const assignmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'assignments');

    // Suscripción segura a locations
    const unsubLoc = onSnapshot(locationsRef, 
      (snapshot) => {
        const dbLocs = [];
        snapshot.forEach(doc => dbLocs.push({ ...doc.data(), id: parseInt(doc.id) }));
        
        const mergedLocations = initialLocations.map(initLoc => {
          const cloudLoc = dbLocs.find(l => l.id === initLoc.id);
          return cloudLoc || initLoc;
        });
        
        setLocations(mergedLocations.sort((a,b) => a.id - b.id));
        setLoading(false);
      },
      (error) => {
        console.error("Error Loc:", error);
        setLocations(initialLocations);
        setLoading(false);
      }
    );

    // Suscripción segura a assignments
    const unsubAsgn = onSnapshot(assignmentsRef,
      (snapshot) => {
        const dbAsgns = [];
        snapshot.forEach(doc => dbAsgns.push({ ...doc.data(), id: parseInt(doc.id) }));
        
        const mergedAssignments = initialAssignments.map(initAsgn => {
          const cloudAsgn = dbAsgns.find(a => a.id === initAsgn.id);
          return cloudAsgn || initAsgn;
        });
        
        const newCloudAsgns = dbAsgns.filter(dbA => !initialAssignments.some(initA => initA.id === dbA.id));
        setAssignments([...mergedAssignments, ...newCloudAsgns]);
      },
      (error) => {
        console.error("Error Asgn:", error);
        setAssignments(initialAssignments);
      }
    );

    return () => { unsubLoc(); unsubAsgn(); };
  }, [isAuthReady, firebaseUser]);

  const handleSaveLocation = async (updatedLocation) => {
    setLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));

    if (isLocalDev || !firebaseUser) return;
    try {
      const locRef = doc(db, 'artifacts', appId, 'public', 'data', 'locations', updatedLocation.id.toString());
      await setDoc(locRef, updatedLocation);
    } catch (error) {
      console.error("Error guardando en la nube:", error);
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center text-orange-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Cargando producción...</p>
        </div>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-orange-600 p-8 text-center text-white flex-shrink-0">
            <h1 className="text-3xl font-black mb-2">FIT26</h1>
            <p className="opacity-90">Acceso a Producción</p>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            <h2 className="text-gray-500 font-bold text-sm uppercase mb-4 text-center">Selecciona tu perfil</h2>
            {initialUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUserProfile(user)}
                className={`w-full p-4 rounded-xl font-bold flex items-center justify-between transition-transform active:scale-95 text-left ${
                  user.role === 'admin' ? 'bg-gray-900 text-white hover:bg-gray-800 mb-6' : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                <div className="flex items-center">
                  {user.role === 'admin' ? <Lock className="w-5 h-5 mr-3 flex-shrink-0" /> : <User className="w-5 h-5 mr-3 flex-shrink-0" />}
                  <span className="truncate">{user.name}</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180 opacity-50 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen flex flex-col overflow-hidden">
        {currentUserProfile.role === 'admin' ? (
          <AdminDashboard locations={locations} assignments={assignments} onSaveLocation={handleSaveLocation} onLogout={() => setCurrentUserProfile(null)} />
        ) : (
          <CompanyDashboard user={currentUserProfile} locations={locations} assignments={assignments} onLogout={() => setCurrentUserProfile(null)} />
        )}
      </div>
    </div>
  );
}

// --- VISTA SUPERADMINISTRADOR ---
function AdminDashboard({ locations, assignments, onSaveLocation, onLogout }) {
  const [activeTab, setActiveTab] = useState('espacios');
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [search, setSearch] = useState('');

  const handleSave = (updatedLoc) => {
    onSaveLocation(updatedLoc);
    setSelectedLocationId(null);
  };

  if (selectedLocationId) {
    return <DetailView location={locations.find(l => l.id === selectedLocationId)} onBack={() => setSelectedLocationId(null)} onSave={handleSave} readOnly={false} />;
  }

  const filteredLocations = locations.filter(loc => loc.name.toLowerCase().includes(search.toLowerCase()) || loc.municipality.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center"><Lock className="w-4 h-4 mr-2 text-orange-500" /> SuperAdmin</h1>
            <p className="text-xs text-gray-400 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${isLocalDev ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
              {isLocalDev ? 'Modo de prueba local' : 'Conectado a la nube'}
            </p>
          </div>
          <button onClick={onLogout} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><LogOut className="w-4 h-4" /></button>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button onClick={() => setActiveTab('espacios')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'espacios' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}>Espacios</button>
          <button onClick={() => setActiveTab('agenda')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'agenda' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}>Agenda</button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {activeTab === 'espacios' ? (
          <>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Buscar espacio..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
            </div>
            <div className="space-y-3">
              {filteredLocations.map(loc => (
                <div key={loc.id} onClick={() => setSelectedLocationId(loc.id)} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                  <h2 className="font-bold text-gray-900 leading-tight">{loc.name}</h2>
                  <div className="mt-2 flex items-center text-sm text-gray-500"><MapPin className="w-4 h-4 mr-1" /><span className="truncate">{loc.municipality}</span></div>
                  {(loc.capacity || loc.techSpecs || loc.photos?.length > 0 || loc.generalContactName) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3 text-xs text-green-600 font-medium flex-wrap">
                      {loc.capacity && <span className="flex items-center"><Users className="w-3 h-3 mr-1"/> {loc.capacity} pax</span>}
                      {loc.techSpecs && <span className="flex items-center"><Settings className="w-3 h-3 mr-1"/> Ficha OK</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Asignaciones</h3>
            {[...assignments].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).map(assign => {
              const loc = locations.find(l => l.id === assign.locationId);
              const comp = initialUsers.find(u => u.id === assign.companyId);
              const acc = accommodationsList.find(a => a.id === assign.accommodationId);
              if(!loc || !comp) return null;
              return (
                <div key={assign.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{comp.name}</h4>
                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-md">{assign.date} - {assign.time}</span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center mb-1"><MapPin className="w-3 h-3 mr-2" /> {loc.name}</div>
                  <div className="text-sm text-gray-600 flex items-center"><Bed className="w-3 h-3 mr-2" /> {acc?.name}</div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// --- VISTA COMPAÑÍA (USUARIO) ---
function CompanyDashboard({ user, locations, assignments, onLogout }) {
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  if (selectedLocationId) {
    return <DetailView location={locations.find(l => l.id === selectedLocationId)} onBack={() => setSelectedLocationId(null)} readOnly={true} />;
  }

  const myAssignments = assignments.filter(a => a.companyId === user.id);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-orange-600 text-white p-5 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <div className="overflow-hidden pr-2">
            <p className="text-orange-200 text-sm">Bienvenido/a</p>
            <h1 className="text-xl font-black truncate">{user.name}</h1>
          </div>
          <button onClick={onLogout} className="p-2 bg-orange-700 rounded-full hover:bg-orange-800 flex-shrink-0"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <h2 className="font-bold text-gray-800 flex items-center"><Calendar className="w-5 h-5 mr-2 text-orange-600" /> Mi Itinerario</h2>
        {myAssignments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center shadow-sm border border-gray-100 text-gray-500">No tienes actuaciones asignadas en este momento.</div>
        ) : (
          [...myAssignments].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).map((assign) => {
            const loc = locations.find(l => l.id === assign.locationId);
            const acc = accommodationsList.find(a => a.id === assign.accommodationId);
            if(!loc) return null;
            return (
              <div key={assign.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-orange-500 text-white rounded-lg p-2 mr-3 text-center leading-none">
                      <span className="block text-xs uppercase">{new Date(assign.date).toLocaleString('es', { month: 'short' })}</span>
                      <span className="block text-xl font-bold">{new Date(assign.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{assign.time} h</h3>
                      <p className="text-gray-400 text-xs">{loc.municipality}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="pr-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">Espacio Escénico</p>
                      <p className="font-bold text-gray-900 leading-tight">{loc.name}</p>
                    </div>
                    <button onClick={() => setSelectedLocationId(loc.id)} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-200 flex-shrink-0">Ver Ficha</button>
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center"><Bed className="w-3 h-3 mr-1"/> Alojamiento</p>
                     <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-800 text-sm truncate">{acc?.name || 'Pendiente'}</span>
                        {acc && <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 bg-white border border-gray-200 p-1.5 rounded-md hover:bg-gray-100 flex-shrink-0 ml-2"><ExternalLink className="w-4 h-4" /></a>}
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

// --- VISTA DETALLE DEL ESPACIO ---
function DetailView({ location, onBack, onSave, readOnly = false }) {
  const [formData, setFormData] = useState({ ...location });
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => { if(!readOnly) setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const addPhoto = () => { if (!readOnly && newPhotoUrl.trim()) { setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), newPhotoUrl.trim()] })); setNewPhotoUrl(''); } };
  const removePhoto = (index) => { if(!readOnly) setFormData(prev => ({ ...prev, photos: (prev.photos || []).filter((_, i) => i !== index) })); };

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm outline-none ${readOnly ? 'bg-gray-50 border-transparent text-gray-700 font-medium cursor-default' : 'bg-white border-gray-300 focus:ring-2 focus:ring-orange-500'}`;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ChevronLeft className="w-6 h-6" /></button>
          <div className="ml-2 flex-1 overflow-hidden">
            <div className="flex items-center">
              <h2 className="font-bold text-lg truncate text-gray-900">{formData.name}</h2>
              {readOnly && <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold flex items-center flex-shrink-0"><Lock className="w-3 h-3 mr-1"/> Lectura</span>}
            </div>
            <p className="text-xs text-gray-500 truncate">{formData.address}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><Camera className="w-4 h-4 mr-2 text-orange-600" /> Galería Visual</h3>
          <div className="flex overflow-x-auto gap-2 pb-2 mb-3 snap-x">
            {(formData.photos || []).map((photo, i) => (
              <div key={i} className="relative w-32 h-32 flex-shrink-0 snap-start">
                <img src={photo} alt={`Vista ${i+1}`} className="w-full h-full object-cover rounded-lg" />
                {!readOnly && <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">×</button>}
              </div>
            ))}
            {!(formData.photos?.length > 0) && <div className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 text-sm"><ImageIcon className="w-6 h-6 mb-1 opacity-50" />Sin fotos</div>}
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <input type="text" placeholder="URL de imagen..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} />
              <button onClick={addPhoto} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Añadir</button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><User className="w-4 h-4 mr-2 text-orange-600" /> Directorio de Contactos</h3>
          <div className="space-y-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <h4 className="text-xs font-bold text-orange-800 mb-2 uppercase">Contacto General (Administración)</h4>
              <input readOnly={readOnly} name="generalContactName" value={formData.generalContactName || ''} onChange={handleChange} placeholder="Nombre y cargo" className={`${inputClass} mb-2`} />
              <div className="flex gap-2">
                <input readOnly={readOnly} type="tel" name="generalContactPhone" value={formData.generalContactPhone || ''} onChange={handleChange} placeholder="Teléfono" className={inputClass} />
                <input readOnly={readOnly} type="email" name="generalContactEmail" value={formData.generalContactEmail || ''} onChange={handleChange} placeholder="Email" className={inputClass} />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Contacto Técnico (Sala)</h4>
              <input readOnly={readOnly} name="roomContactName" value={formData.roomContactName || ''} onChange={handleChange} placeholder="Nombre del técnico" className={`${inputClass} mb-2`} />
              <div className="flex gap-2">
                <input readOnly={readOnly} type="tel" name="roomContactPhone" value={formData.roomContactPhone || ''} onChange={handleChange} placeholder="Teléfono" className={inputClass} />
                <input readOnly={readOnly} type="email" name="roomContactEmail" value={formData.roomContactEmail || ''} onChange={handleChange} placeholder="Email" className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><Maximize className="w-4 h-4 mr-2 text-orange-600" /> Datos de la Sala</h3>
          <div className="mb-4 relative">
             <label className="block text-xs text-gray-500 mb-1">Aforo Total</label>
             <input readOnly={readOnly} type="number" name="capacity" value={formData.capacity || ''} onChange={handleChange} placeholder="Nº de butacas" className={inputClass} />
          </div>
          <label className="block text-xs text-gray-500 mb-1">Dimensiones del Escenario (Metros)</label>
          <div className="grid grid-cols-3 gap-3">
            <div><input readOnly={readOnly} type="number" name="width" value={formData.width || ''} onChange={handleChange} className={`${inputClass} text-center`} placeholder="Ancho" /></div>
            <div><input readOnly={readOnly} type="number" name="depth" value={formData.depth || ''} onChange={handleChange} className={`${inputClass} text-center`} placeholder="Fondo" /></div>
            <div><input readOnly={readOnly} type="number" name="height" value={formData.height || ''} onChange={handleChange} className={`${inputClass} text-center`} placeholder="Alto" /></div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><Settings className="w-4 h-4 mr-2 text-orange-600" /> Condiciones Técnicas</h3>
          <textarea readOnly={readOnly} name="techSpecs" value={formData.techSpecs || ''} onChange={handleChange} rows="3" placeholder="Suelo, accesos de carga, camerinos..." className={`${inputClass} resize-none`}></textarea>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><Lightbulb className="w-4 h-4 mr-2 text-orange-600" /> Iluminación y Sonido</h3>
          <textarea readOnly={readOnly} name="lighting" value={formData.lighting || ''} onChange={handleChange} rows="3" placeholder="Varas, focos, PA..." className={`${inputClass} resize-none`}></textarea>
        </section>
      </main>

      {!readOnly && (
        <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
          <button onClick={handleSaveClick} disabled={isSaving} className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-orange-700 flex items-center justify-center disabled:opacity-50">
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {isSaving ? 'Guardado en modo prueba' : 'Guardar Ficha Técnica'}
          </button>
        </footer>
      )}
    </div>
  );
}