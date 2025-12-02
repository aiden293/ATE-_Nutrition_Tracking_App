import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PlusCircle, TrendingUp, Target, Apple, Calendar, Search, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const formatNutrientName = (name) => {
  const formatted = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  return formatted;
};

const getNutrientUnit = (nutrientName) => {
  const name = nutrientName.toLowerCase();
  // Energy
  if (name === 'calories') return 'kcal';
  // Macronutrients (grams)
  if (['protein', 'carbs', 'fat', 'fiber', 'sugar'].includes(name)) return 'g';
  // Minerals typically in mg
  if (['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc'].includes(name)) return 'mg';
  // Vitamins - varies
  if (name === 'vitamina') return 'µg RAE';
  if (name === 'vitaminc') return 'mg';
  if (name === 'vitamind') return 'µg';
  if (name === 'vitamine') return 'mg';
  if (name === 'vitamink') return 'µg';
  if (name === 'vitaminb6') return 'mg';
  if (name === 'vitaminb12') return 'µg';
  if (name === 'folate') return 'µg DFE';
  if (name === 'niacin') return 'mg';
  // Default
  return 'units';
};

const AteNutritionApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentMeal, setCurrentMeal] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [suggestedMeals, setSuggestedMeals] = useState([]);

  useEffect(() => {
    try {
      const cu = localStorage.getItem('current-user');
      if (cu) {
        const u = JSON.parse(cu);
        setUser(u);
        const p = localStorage.getItem(`profile-${u.username}`);
        if (p) setProfile(JSON.parse(p));
        const m = localStorage.getItem(`meals-${u.username}`);
        if (m) setMeals(JSON.parse(m));
        setCurrentView('dashboard');
      }
    } catch (e) {
      // ignore
    }
  }, []);
  const handleSearch = React.useCallback(async (qRaw) => {
    const q = (qRaw || '').toString().trim();
    if (!q) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/foods/search/${encodeURIComponent(q)}`);
      const data = await res.json();
      const normalized = (data||[]).map(f=>({
        id: f.id || f.fdcId || f.foodId,
        name: f.name || f.description || 'Unknown',
        unit: f.unit || '100 g',
        servingOptions: f.servingOptions || f.foodPortions || [],
        calories: safeNumber(f.calories),
        protein: safeNumber(f.protein),
        carbs: safeNumber(f.carbs),
        fat: safeNumber(f.fat),
        fiber: safeNumber(f.fiber),
        sugar: safeNumber(f.sugar),
        calcium: safeNumber(f.calcium),
        iron: safeNumber(f.iron),
        magnesium: safeNumber(f.magnesium),
        phosphorus: safeNumber(f.phosphorus),
        potassium: safeNumber(f.potassium),
        sodium: safeNumber(f.sodium),
        zinc: safeNumber(f.zinc),
        vitaminA: safeNumber(f.vitaminA),
        vitaminC: safeNumber(f.vitaminC),
        vitaminD: safeNumber(f.vitaminD),
        vitaminE: safeNumber(f.vitaminE),
        vitaminK: safeNumber(f.vitaminK),
        vitaminB6: safeNumber(f.vitaminB6),
        vitaminB12: safeNumber(f.vitaminB12),
        folate: safeNumber(f.folate),
        niacin: safeNumber(f.niacin)
      }));
      setSearchResults(normalized);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    const id = setTimeout(() => handleSearch(q), 300);
    return () => clearTimeout(id);
  }, [searchQuery, handleSearch]);

  const handleAddFoodToMeal = (foodPerUnit, amount) => {
    const qty = safeNumber(amount,1);
    const item = {
      id: foodPerUnit.id,
      name: foodPerUnit.name,
      amount: qty,
      unit: foodPerUnit.unit,
      nutrients: {
        calories: safeNumber(foodPerUnit.calories)*qty,
        protein: safeNumber(foodPerUnit.protein)*qty,
        carbs: safeNumber(foodPerUnit.carbs)*qty,
        fat: safeNumber(foodPerUnit.fat)*qty,
        fiber: safeNumber(foodPerUnit.fiber)*qty,
        sugar: safeNumber(foodPerUnit.sugar)*qty,
        calcium: safeNumber(foodPerUnit.calcium)*qty,
        iron: safeNumber(foodPerUnit.iron)*qty,
        magnesium: safeNumber(foodPerUnit.magnesium)*qty,
        phosphorus: safeNumber(foodPerUnit.phosphorus)*qty,
        potassium: safeNumber(foodPerUnit.potassium)*qty,
        sodium: safeNumber(foodPerUnit.sodium)*qty,
        zinc: safeNumber(foodPerUnit.zinc)*qty,
        vitaminA: safeNumber(foodPerUnit.vitaminA)*qty,
        vitaminC: safeNumber(foodPerUnit.vitaminC)*qty,
        vitaminD: safeNumber(foodPerUnit.vitaminD)*qty,
        vitaminE: safeNumber(foodPerUnit.vitaminE)*qty,
        vitaminK: safeNumber(foodPerUnit.vitaminK)*qty,
        vitaminB6: safeNumber(foodPerUnit.vitaminB6)*qty,
        vitaminB12: safeNumber(foodPerUnit.vitaminB12)*qty,
        folate: safeNumber(foodPerUnit.folate)*qty,
        niacin: safeNumber(foodPerUnit.niacin)*qty
      }
    };
    setCurrentMeal(prev => [...prev, item]);
    setSelectedFood(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCompleteMeal = () => {
    if (!user) return setCurrentView('login');
    if (currentMeal.length === 0) return;
    const totalNutrients = currentMeal.reduce((acc, it) => {
      Object.keys(it.nutrients||{}).forEach(k => acc[k] = safeNumber(acc[k]) + safeNumber(it.nutrients[k]));
      return acc;
    }, {});
    // Use meal date from pending selection if valid
    let chosen = null;
    try { chosen = localStorage.getItem('pending-meal-date'); } catch(e){}
    const isoDate = (chosen && /^\d{4}-\d{2}-\d{2}$/.test(chosen)) ? new Date(chosen+'T12:00:00').toISOString() : new Date().toISOString();
    
    let updated;
    if (editingMeal) {
      // Update existing meal
      const editedMeal = { ...editingMeal, date: isoDate, items: currentMeal, totalNutrients };
      updated = meals.map(m => m.id === editingMeal.id ? editedMeal : m);
      setEditingMeal(null);
    } else {
      // Create new meal
      const newMeal = { id: Date.now(), date: isoDate, items: currentMeal, totalNutrients };
      updated = [...meals, newMeal];
    }
    
    setMeals(updated);
    try { if (user) localStorage.setItem(`meals-${user.username}`, JSON.stringify(updated)); } catch(e){}
    setCurrentMeal([]);
    setCurrentView('dashboard');
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setCurrentMeal(meal.items);
    // Set date for editing
    try {
      const mealDate = new Date(meal.date).toISOString().slice(0,10);
      localStorage.setItem('pending-meal-date', mealDate);
    } catch(e){}
    setCurrentView('log-meal');
  };

  const handleDeleteMeal = (mealId) => {
    if (!user) return;
    const updated = meals.filter(m => m.id !== mealId);
    setMeals(updated);
    try { localStorage.setItem(`meals-${user.username}`, JSON.stringify(updated)); } catch(e){}
  };

  const getWeeklyData = (weekOffset = 0) => {
    const now = new Date();
    const endDate = new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = meals.filter(m => {
      const mealDate = new Date(m.date);
      return mealDate >= startDate && mealDate < endDate;
    });
    if (!recent.length) return null;
    return {
      data: recent.reduce((acc, meal) => {
        Object.keys(meal.totalNutrients||{}).forEach(k => acc[k] = safeNumber(acc[k]) + safeNumber(meal.totalNutrients[k]));
        return acc;
      }, { calories:0, protein:0, carbs:0, fat:0, fiber:0, sugar:0 }),
      startDate,
      endDate
    };
  };
  
  const getAvailableWeeks = () => {
    if (!meals.length) return [];
    const now = new Date();
    const oldestMeal = new Date(Math.min(...meals.map(m => new Date(m.date).getTime())));
    const weeksDiff = Math.ceil((now - oldestMeal) / (7 * 24 * 60 * 60 * 1000));
    const weeks = [];
    for (let i = 0; i < Math.min(weeksDiff, 12); i++) {
      const endDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mealsInWeek = meals.filter(m => {
        const md = new Date(m.date);
        return md >= startDate && md < endDate;
      });
      if (mealsInWeek.length > 0) {
        weeks.push({
          offset: i,
          label: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} Weeks Ago`,
          startDate,
          endDate,
          mealCount: mealsInWeek.length
        });
      }
    }
    return weeks;
  };

  const getSuggestions = () => {
    if (!profile || meals.length === 0) return [];
    const weeklyResult = getWeeklyData(selectedWeekOffset); 
    if (!weeklyResult) return [];
    const weekly = weeklyResult.data;
    const weight = safeNumber(profile.weight,70);
    // Macro targets scaled by bodyweight + fixed fiber/sugar
    const macroTargets = { protein: weight*1.6, carbs: weight*3, fat: weight*0.8, fiber:25, sugar:50 };
    // Micronutrient baseline (approximate general adult values, not sex-specific)
    const microTargets = { calcium:1000, iron:18, magnesium:420, potassium:3500, vitaminC:90, vitaminD:20, vitaminB12:2.4, folate:400, vitaminA:900, vitaminK:120 };
    const targets = { ...macroTargets, ...microTargets };
    const daily = {}; Object.keys(weekly).forEach(k=>daily[k]=safeNumber(weekly[k])/7);
    return Object.keys(targets)
      .filter(n=> safeNumber(daily[n]) < targets[n])
      .map(n=> ({ nutrient:n, deficit: targets[n] - safeNumber(daily[n]), daily: safeNumber(daily[n]), target: targets[n] }))
      .sort((a,b)=> b.deficit - a.deficit)
      .slice(0,8);
  };

  const fetchMealSuggestions = React.useCallback(async (deficiencies) => {
    if (!deficiencies || deficiencies.length === 0) {
      setSuggestedMeals([]);
      return;
    }
    try {
      const allergies = profile?.allergies || '';
      const res = await fetch(`${API_URL}/suggest-meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deficiencies, allergies })
      });
      const data = await res.json();
      setSuggestedMeals(data || []);
    } catch (e) {
      console.error('Failed to fetch meal suggestions:', e);
      setSuggestedMeals([]);
    }
  }, [profile]);

  const handleAddSuggestedMeal = (meal) => {
    setCurrentMeal(meal.foods);
    setCurrentView('log-meal');
  };

  // Compute these before early returns
  const weeklyResult = getWeeklyData(selectedWeekOffset);
  const weeklyData = weeklyResult ? weeklyResult.data : null;
  const weeklyDateRange = weeklyResult ? { start: weeklyResult.startDate, end: weeklyResult.endDate } : null;
  const availableWeeks = getAvailableWeeks();
  const suggestions = getSuggestions();
  
  // Fetch meal suggestions when deficiencies change
  React.useEffect(() => {
    if (suggestions.length > 0) {
      fetchMealSuggestions(suggestions);
    } else {
      setSuggestedMeals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions.length, selectedWeekOffset, meals.length]);

  if (currentView === 'login') return <LoginView onLogin={(u,p)=>{
    try { const stored = localStorage.getItem(`user-${u}`); if (!stored) return false; const su = JSON.parse(stored); if (su.password === p) { localStorage.setItem('current-user', JSON.stringify(su)); setUser(su); const prof = localStorage.getItem(`profile-${u}`); if (prof) setProfile(JSON.parse(prof)); const ms = localStorage.getItem(`meals-${u}`); if (ms) setMeals(JSON.parse(ms)); setCurrentView('dashboard'); return true; } } catch(e){} return false; }} onCreateAccount={(u,p)=>{ const nu={username:u,password:p}; localStorage.setItem(`user-${u}`, JSON.stringify(nu)); localStorage.setItem('current-user', JSON.stringify(nu)); setUser(nu); setCurrentView('create-profile'); return true; }} />;

  if (currentView === 'create-profile') return <CreateProfileView onSubmit={(pd)=>{ if(!user) return setCurrentView('login'); localStorage.setItem(`profile-${user.username}`, JSON.stringify(pd)); setProfile(pd); setCurrentView('dashboard'); }} />;

  if (currentView === 'profile') return <ProfileView profile={profile} onUpdate={(pd)=>{ if(!user) return; localStorage.setItem(`profile-${user.username}`, JSON.stringify(pd)); setProfile(pd); }} onBack={()=>setCurrentView('dashboard')} />;

  if (currentView === 'meals') return <MealsView meals={meals} onBack={()=>setCurrentView('dashboard')} onEdit={handleEditMeal} onDelete={handleDeleteMeal} />;
  if (currentView === 'charts') return <ChartsView meals={meals} onBack={()=>setCurrentView('dashboard')} />;

  if (currentView === 'log-meal') {
    return (
      <div className="min-h-screen p-4 md:p-6" style={{backgroundColor: '#17b564'}}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-emerald-700">{editingMeal ? 'Edit Meal' : 'Log Meal'}</h2>
              <button onClick={()=>{ setCurrentView('dashboard'); setEditingMeal(null); setCurrentMeal([]); }} className="text-white bg-gray-700 hover:bg-gray-800 p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg"><X size={24} /></button>
            </div>
            {/* Date selection */}
            <MealDateInput />

            <div className="mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-4 text-emerald-600" size={24} />
                  <input type="text" placeholder="Search for food..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 border-4 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none shadow-lg transition font-semibold text-lg" />
                </div>
                <button onClick={handleSearch} disabled={isSearching} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all duration-300 font-black disabled:bg-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105">{isSearching ? 'Searching...' : 'Search'}</button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map(food => (
                    <button key={food.id} onClick={() => setSelectedFood(food)} className="w-full text-left px-4 py-3 hover:bg-green-50 transition border-b border-gray-100 last:border-b-0">
                      <div className="font-medium text-gray-800">{food.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{food.unit} | {Math.round(food.calories)} cal | P: {food.protein.toFixed(1)}g | C: {food.carbs.toFixed(1)}g | F: {food.fat.toFixed(1)}g</div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="mt-2 text-center text-gray-500 py-4">No results found. Try a different search term.</div>
              )}
            </div>

            {selectedFood && <AddFoodForm food={selectedFood} onAdd={handleAddFoodToMeal} onCancel={()=>setSelectedFood(null)} />}

            {currentMeal.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Current Meal</h3>
                <div className="space-y-2">
                  {currentMeal.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-xs text-gray-500">{Math.round(safeNumber(item.nutrients?.calories))} cal | P: {safeNumber(item.nutrients?.protein).toFixed(1)}g | Amount: {item.amount} {item.unit}</div>
                      </div>
                      <button onClick={()=>setCurrentMeal(prev => prev.filter((_,i)=>i!==idx))} className="text-red-500 hover:text-red-700"><X size={20} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={handleCompleteMeal} className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl hover:bg-emerald-700 transition-all duration-300 font-black text-lg shadow-2xl transform hover:scale-105">{editingMeal ? 'Update Meal' : 'Complete Meal'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inject micronutrients into suggestions baseline if missing
  const micronutrientTargets = { calcium:1000, iron:18, magnesium:420, potassium:3500, vitaminC:90, vitaminD:20, vitaminB12:2.4, folate:400 };
  if (weeklyData) {
    Object.keys(micronutrientTargets).forEach(k=> { if (!(k in weeklyData)) weeklyData[k] = 0; });
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{backgroundColor: '#17b564'}}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8 bg-white rounded-3xl p-5 md:p-7 shadow-2xl border-4 border-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-emerald-700" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>ATE!</h1>
            <p className="text-gray-600 text-base md:text-lg font-semibold">Welcome back, {profile?.name || user?.username}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setCurrentView('profile')} className="px-4 md:px-5 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-emerald-700">Profile</button>
            <button onClick={()=>{ setUser(null); setProfile(null); setMeals([]); localStorage.removeItem('current-user'); setCurrentView('login'); }} className="px-4 md:px-5 py-3 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-gray-800">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 mb-6 md:mb-8">
          <button onClick={()=>setCurrentView('log-meal')} className="bg-white text-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 hover:-rotate-1 group border-4 border-white">
            <PlusCircle size={40} className="mb-3 text-emerald-600 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <h3 className="text-xl md:text-2xl font-black">Log Meal</h3>
            <p className="text-gray-600 text-base font-semibold mt-2">Track your food intake</p>
          </button>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
            <Target size={40} className="text-emerald-600 mb-3" />
            <h3 className="text-xl md:text-2xl font-black text-gray-800">Total Meals</h3>
            <p className="text-5xl font-black text-emerald-600">{meals.length}</p>
          </div>

          <button onClick={()=>setCurrentView('meals')} className="bg-white text-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 hover:rotate-1 group border-4 border-white">
            <Calendar size={40} className="mb-3 text-emerald-600 group-hover:scale-125 group-hover:-rotate-12 transition-transform" />
            <h3 className="text-xl md:text-2xl font-black">Meal History</h3>
            <p className="text-gray-600 text-base font-semibold mt-2">View logged meals</p>
          </button>

          <button onClick={()=>setCurrentView('charts')} className="bg-white text-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 hover:-rotate-1 group border-4 border-white">
            <TrendingUp size={40} className="mb-3 text-emerald-600 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <h3 className="text-xl md:text-2xl font-black">Analytics</h3>
            <p className="text-gray-600 text-base font-semibold mt-2">Visualize trends</p>
          </button>
        </div>

        {availableWeeks.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl p-5 shadow-2xl border-4 border-white">
            <label className="block text-lg font-black text-gray-800 mb-3">Analyze Week</label>
            <select 
              value={selectedWeekOffset} 
              onChange={e=>setSelectedWeekOffset(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none bg-white shadow-sm transition"
            >
              {availableWeeks.map(week => (
                <option key={week.offset} value={week.offset}>
                  {week.label} ({week.startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {week.endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}) • {week.mealCount} meals
                </option>
              ))}
            </select>
          </div>
        )}

        {weeklyData ? (
          <WeeklyAnalysisView weeklyData={weeklyData} dateRange={weeklyDateRange} />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Not enough data - log meals for weekly analysis</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="bg-white text-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 mb-6 md:mb-8 border-4 border-white transform hover:scale-[1.01] transition-all duration-300">
            <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center text-emerald-700"><Apple className="mr-3" size={36} /> Nutrition Recommendations</h2>
            
            {/* Macronutrients */}
            {suggestions.filter(s => ['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(s.nutrient)).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Macronutrients</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {suggestions.filter(s => ['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(s.nutrient)).map((s, i) => {
                    const unit = getNutrientUnit(s.nutrient);
                    return (
                      <div key={i} className="bg-white bg-opacity-80 border-2 border-white rounded-xl p-4 shadow-md">
                        <p className="font-bold mb-1 text-gray-800">{formatNutrientName(s.nutrient)}</p>
                        <p className="text-xs mb-2 text-gray-600">Daily avg: {s.daily.toFixed(1)} {unit} / Target: {s.target} {unit}</p>
                        <p className="text-sm font-bold mb-1 text-orange-500">Deficit: {s.deficit.toFixed(1)} {unit}/day</p>
                        <p className="text-sm text-gray-600">Consider adding more foods rich in {formatNutrientName(s.nutrient).toLowerCase()}.</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Micronutrients */}
            {suggestions.filter(s => !['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(s.nutrient)).length > 0 && (
              <details className="bg-white bg-opacity-60 border-2 border-white rounded-xl p-4 shadow-md">
                <summary className="cursor-pointer font-bold text-lg mb-2 text-gray-800">
                  Micronutrients ({suggestions.filter(s => !['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(s.nutrient)).length} deficiencies)
                </summary>
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  {suggestions.filter(s => !['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(s.nutrient)).map((s, i) => {
                    const unit = getNutrientUnit(s.nutrient);
                    return (
                      <div key={i} className="bg-white bg-opacity-50 border border-gray-300 rounded-lg p-3 text-sm shadow-sm">
                        <p className="font-bold mb-1 text-gray-800">{formatNutrientName(s.nutrient)}</p>
                        <p className="text-xs mb-1 text-gray-600">Avg: {s.daily.toFixed(1)} {unit}</p>
                        <p className="text-xs text-gray-600">Target: {s.target} {unit}</p>
                        <p className="text-xs font-bold mt-1 text-orange-500">Need: +{s.deficit.toFixed(1)} {unit}/day</p>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-white">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 flex items-center"><Apple className="mr-3 text-emerald-600" size={36} /> Suggested Meals</h2>
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-xl font-semibold text-gray-800 mb-2">No Nutritional Deficiencies Detected!</p>
              <p className="text-gray-600">You're meeting your nutritional targets for the selected week. Keep up the great work!</p>
            </div>
          ) : suggestedMeals.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">These meals address multiple nutritional deficiencies at once:</p>
              <div className="grid md:grid-cols-2 gap-5 md:gap-7">
                {suggestedMeals.slice(0, 4).map(meal => (
                  <div key={meal.id} className="border-4 border-gray-200 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 bg-gray-50 transform hover:scale-105 hover:-rotate-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{meal.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{meal.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{meal.deficitsCovered} deficits</p>
                        <p className="text-xs text-gray-500">covered</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 space-y-1">
                      {meal.foods.map((food, idx) => (
                        <div key={idx} className="text-sm text-gray-700 flex justify-between">
                          <span>• {food.name}</span>
                          <span className="text-gray-500">{food.amount} {food.unit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-3 pb-3 border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Calories: {Math.round(meal.totalNutrients.calories)}</span>
                        <span>Protein: {meal.totalNutrients.protein.toFixed(1)}g</span>
                        <span>Carbs: {meal.totalNutrients.carbs.toFixed(1)}g</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleAddSuggestedMeal(meal)}
                      className="w-full bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700 transition-all duration-300 font-black shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Add to Log
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-lg font-semibold text-gray-800 mb-2">Loading meal suggestions...</p>
              <p className="text-gray-600">Analyzing your deficiencies to find the best meals for you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Date input component with validation
const MealDateInput = () => {
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10));
  // store globally via localStorage temp key so handleCompleteMeal picks it up
  const today = new Date().toISOString().slice(0,10);
  const error = React.useMemo(() => {
    if (!date) return 'Date required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Invalid format';
    if (date > today) return 'Cannot be future date';
    return null;
  }, [date, today]);
  useEffect(()=>{ try { localStorage.setItem('pending-meal-date', date); } catch(e){} }, [date]);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Meal Date</label>
      <input type="date" value={date} max={today} onChange={e=>setDate(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// Weekly Analysis View with expandable micronutrients
const WeeklyAnalysisView = ({ weeklyData, dateRange }) => {
  const [showMicro, setShowMicro] = React.useState(false);
  
  const macroNutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'];
  const macroData = Object.entries(weeklyData).filter(([k]) => macroNutrients.includes(k));
  const microData = Object.entries(weeklyData).filter(([k]) => !macroNutrients.includes(k));
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2" /> Weekly Analysis
        </h2>
        {dateRange && (
          <p className="text-sm text-gray-500">
            {dateRange.start.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} - {dateRange.end.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
          </p>
        )}
      </div>
      
      {/* Macronutrients - Card Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {macroData.map(([nutrient, value]) => (
          <div key={nutrient} className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100 hover:shadow-md transition">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{formatNutrientName(nutrient)}</p>
            <p className="text-3xl font-bold text-gray-800">{safeNumber(value).toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">total (7 days)</p>
          </div>
        ))}
      </div>
      
      {/* Micronutrients - Expandable */}
      {microData.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <button 
            onClick={() => setShowMicro(!showMicro)}
            className="flex items-center justify-between w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition"
          >
            <span className="font-semibold text-gray-700">
              {showMicro ? '▼' : '▶'} Micronutrients & Minerals
            </span>
            <span className="text-sm text-gray-500">{microData.length} nutrients</span>
          </button>
          
          {showMicro && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {microData.map(([nutrient, value]) => (
                <div key={nutrient} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{formatNutrientName(nutrient)}</p>
                  <p className="text-lg font-semibold text-gray-800">{safeNumber(value).toFixed(1)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Meals list view
const MealsView = ({ meals, onBack, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  
  if (!meals.length) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Meals</h2>
        <p className="text-gray-600 mb-6">No meals logged yet.</p>
        <button onClick={onBack} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">Back</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Meal History</h2>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800"><X /></button>
        </div>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {meals.slice().reverse().map(meal => (
            <div key={meal.id} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-green-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{new Date(meal.date).toLocaleDateString()}</h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 mr-2">Items: {meal.items.length}</div>
                  <button onClick={()=>onEdit(meal)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition">Edit</button>
                  {confirmDelete === meal.id ? (
                    <div className="flex gap-1">
                      <button onClick={()=>{onDelete(meal.id); setConfirmDelete(null);}} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Confirm</button>
                      <button onClick={()=>setConfirmDelete(null)} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={()=>setConfirmDelete(meal.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">Delete</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                {Object.entries(meal.totalNutrients || {}).slice(0,12).map(([k,v]) => (
                  <div key={k} className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">{formatNutrientName(k)}</p>
                    <p className="font-semibold">{safeNumber(v).toFixed(1)}</p>
                  </div>
                ))}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-green-700">Show items</summary>
                <ul className="mt-2 space-y-1">
                  {meal.items.map((it,i)=>(
                    <li key={i} className="flex justify-between border-b last:border-b-0 py-1">
                      <span>{it.name} x {it.amount} {it.unit}</span>
                      <span>{Math.round(safeNumber(it.nutrients?.calories))} cal</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple charts view (placeholder until chart lib installed)
const ChartsView = ({ meals, onBack }) => {
  const [nutrient, setNutrient] = useState('calories');
  // aggregate per day
  const perDay = React.useMemo(()=>{
    const map = {};
    meals.forEach(m=>{
      const d = new Date(m.date).toISOString().slice(0,10);
      const val = safeNumber(m.totalNutrients?.[nutrient]);
      map[d] = safeNumber(map[d]) + val;
    });
    return Object.entries(map).sort((a,b)=> a[0].localeCompare(b[0]));
  }, [meals, nutrient]);
  const nutrientKeys = React.useMemo(()=>{
    const set = new Set();
    meals.forEach(m=> Object.keys(m.totalNutrients||{}).forEach(k=> set.add(k)));
    return Array.from(set).sort();
  }, [meals]);
  const chartData = perDay.map(([d,v])=>({ date:d, value: safeNumber(v) }));
  return (
    <div className="min-h-screen p-4 md:p-6" style={{backgroundColor: '#17b564'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-emerald-700">Nutrition Charts</h2>
          <button onClick={onBack} className="text-white bg-gray-700 hover:bg-gray-800 p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg"><X /></button>
        </div>
        <div className="mb-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nutrient</label>
            <select value={nutrient} onChange={e=>setNutrient(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none">
              {nutrientKeys.map(k=> <option key={k} value={k}>{formatNutrientName(k)}</option>)}
            </select>
          </div>
        </div>
        <div className="h-80 w-full mb-6">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top:10, right:20, left:0, bottom:10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:12 }} />
                <Tooltip formatter={(val)=> safeNumber(val).toFixed(2)} labelFormatter={l=>`Date: ${l}`} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r:4, fill:'#22c55e' }} activeDot={{ r:6, fill:'#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">No data yet for charts.</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr><th className="text-left px-2 py-1">Date</th><th className="text-left px-2 py-1">{formatNutrientName(nutrient)}</th></tr></thead>
            <tbody>
              {chartData.map(row => (
                <tr key={row.date} className="even:bg-gray-50">
                  <td className="px-2 py-1">{row.date}</td>
                  <td className="px-2 py-1">{row.value.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ onLogin, onCreateAccount }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async () => {
    setError('');
    if (isCreating) {
      const ok = await onCreateAccount(username, password);
      if (!ok) setError('Failed to create account');
    } else {
      const ok = await onLogin(username, password);
      if (!ok) setError('Invalid username or password');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#17b564'}}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border-4 border-white transform hover:scale-105 transition-all duration-300">
        <h1 className="text-6xl font-black text-center mb-3 text-emerald-700" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>ATE!</h1>
        <p className="text-center text-gray-600 mb-10 text-lg font-semibold">Track your nutrition with real data</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-black text-lg shadow-lg transform hover:scale-105">{isCreating ? 'Create Account' : 'Login'}</button>
          <button onClick={()=>{ setIsCreating(!isCreating); setError(''); }} className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm">{isCreating ? 'Already have an account? Login' : "Don't have an account? Create one"}</button>
        </div>
      </div>
    </div>
  );
};

const CreateProfileView = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name:'', age:'', sex:'male', height:'', weight:'', allergies:'' });
  const handle = () => onSubmit({ ...formData, age:parseInt(formData.age)||0, height:parseFloat(formData.height)||0, weight:parseFloat(formData.weight)||0 });
  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{backgroundColor: '#17b564'}}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border-4 border-white">
        <h2 className="text-4xl font-black text-emerald-700 mb-8">Create Your Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={formData.age} onChange={e=>setFormData({...formData, age:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select value={formData.sex} onChange={e=>setFormData({...formData, sex:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" step="0.1" value={formData.height} onChange={e=>setFormData({...formData, height:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e=>setFormData({...formData, weight:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
            <input type="text" value={formData.allergies} onChange={e=>setFormData({...formData, allergies:e.target.value})} placeholder="e.g., peanuts, shellfish" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
          </div>
          <button onClick={handle} className="w-full bg-emerald-600 text-white py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-black text-lg shadow-lg transform hover:scale-105">Create Profile</button>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ profile, onUpdate, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: profile?.name || '', 
    age: profile?.age || '', 
    sex: profile?.sex || 'male', 
    height: profile?.height || '', 
    weight: profile?.weight || '', 
    allergies: profile?.allergies || '' 
  });

  const handleSave = () => {
    onUpdate({ 
      ...formData, 
      age: parseInt(formData.age) || 0, 
      height: parseFloat(formData.height) || 0, 
      weight: parseFloat(formData.weight) || 0 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ 
      name: profile?.name || '', 
      age: profile?.age || '', 
      sex: profile?.sex || 'male', 
      height: profile?.height || '', 
      weight: profile?.weight || '', 
      allergies: profile?.allergies || '' 
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{backgroundColor: '#17b564'}}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-emerald-700">My Profile</h2>
            <button onClick={onBack} className="px-4 py-2 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-bold shadow-lg transform hover:scale-105">Back</button>
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Name</p>
                  <p className="text-xl font-bold text-gray-800">{profile?.name || 'Not set'}</p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Age</p>
                  <p className="text-xl font-bold text-gray-800">{profile?.age || 'Not set'}</p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Sex</p>
                  <p className="text-xl font-bold text-gray-800 capitalize">{profile?.sex || 'Not set'}</p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Height</p>
                  <p className="text-xl font-bold text-gray-800">{profile?.height ? `${profile.height} cm` : 'Not set'}</p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Weight</p>
                  <p className="text-xl font-bold text-gray-800">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Allergies</p>
                  <p className="text-xl font-bold text-gray-800">{profile?.allergies || 'None'}</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(true)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-black text-lg shadow-lg transform hover:scale-105">Edit Profile</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" value={formData.age} onChange={e=>setFormData({...formData, age:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                  <select value={formData.sex} onChange={e=>setFormData({...formData, sex:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input type="number" step="0.1" value={formData.height} onChange={e=>setFormData({...formData, height:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={formData.weight} onChange={e=>setFormData({...formData, weight:e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
                <input type="text" value={formData.allergies} onChange={e=>setFormData({...formData, allergies:e.target.value})} placeholder="e.g., peanuts, shellfish" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-black text-lg shadow-lg transform hover:scale-105">Save Changes</button>
                <button onClick={handleCancel} className="px-8 bg-gray-200 text-gray-700 py-4 rounded-2xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddFoodForm = ({ food, onAdd, onCancel }) => {
  const [amount, setAmount] = useState('1');
  const [selectedServing, setSelectedServing] = useState(food.servingOptions && food.servingOptions.length ? food.servingOptions[0] : null);
  const [overrideGrams, setOverrideGrams] = useState('');
  const DEFAULT_FALLBACKS = { piece:50, bowl:300 };
  const getGramsPerUnit = (serv) => {
    if (!serv) return null;
    if (serv.gramsPerUnit != null) return Number(serv.gramsPerUnit);
    if (serv.gramWeight != null) return Number(serv.gramWeight);
    if (overrideGrams) return Number(overrideGrams) || null;
    const key = (serv.unit || serv.label || '').toString().toLowerCase();
    return DEFAULT_FALLBACKS[key] || null;
  };
  const getPerUnit = () => {
    const grams = getGramsPerUnit(selectedServing);
    const ratio = grams ? (grams/100) : 1;
    return {
      id: food.id,
      name: food.name,
      unit: selectedServing?.unit || selectedServing?.label || 'unit',
      gramsPerUnit: grams,
      calories: safeNumber(food.calories)*ratio,
      protein: safeNumber(food.protein)*ratio,
      carbs: safeNumber(food.carbs)*ratio,
      fat: safeNumber(food.fat)*ratio,
      fiber: safeNumber(food.fiber)*ratio,
      sugar: safeNumber(food.sugar)*ratio,
    };
  };
  const perUnit = getPerUnit();
  const handleSubmit = () => { const qty = safeNumber(amount,1); if (qty<=0) return; onAdd(perUnit, qty); };
  return (
    <div className="bg-green-50 p-6 rounded-lg mb-6">
      <h3 className="font-semibold text-lg mb-2">Adding: {food.name}</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Measurement</label>
        <select value={selectedServing?.label||''} onChange={e=>{ const sel=(food.servingOptions||[]).find(s=>s.label===e.target.value); if(sel){ setSelectedServing(sel); setOverrideGrams(''); } }} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none">
          {(food.servingOptions||[]).map(opt=> <option key={opt.label || opt.gramsPerUnit || opt.gramWeight} value={opt.label}>{opt.label} {opt.gramsPerUnit?`(~${opt.gramsPerUnit} g)`:opt.gramWeight?`(~${opt.gramWeight} g)`:'(estimate)'}</option>)}
        </select>
      </div>
      {selectedServing && getGramsPerUnit(selectedServing) == null && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Approx grams per {selectedServing.label} (optional)</label>
          <input type="number" step="1" min="1" value={overrideGrams} onChange={e=>setOverrideGrams(e.target.value)} placeholder="e.g. 50" className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
          <p className="text-xs text-gray-500 mt-1">If left empty, a small default will be used for calculations.</p>
        </div>
      )}
      <p className="text-sm text-gray-600 mb-4">Per unit: {perUnit.gramsPerUnit?`${perUnit.gramsPerUnit} g`:'approx unknown'} | {Math.round(perUnit.calories)} cal | P: {perUnit.protein.toFixed(1)}g | C: {perUnit.carbs.toFixed(1)}g | F: {perUnit.fat.toFixed(1)}g</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (units)</label>
        <input type="number" step="0.1" min="0.1" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">Add to Meal</button>
        <button onClick={onCancel} className="px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancel</button>
      </div>
    </div>
  );
};

export default AteNutritionApp;