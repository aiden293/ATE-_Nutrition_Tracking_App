import React, { useState, useEffect } from 'react';
import { User, PlusCircle, TrendingUp, Target, Apple, Calendar, Search, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// 안전하게 숫자로 변환하는 헬퍼 함수
const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const AteNutritionApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  
  // 음식 검색 관련
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 현재 식사
  const [currentMeal, setCurrentMeal] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  // 로그인 상태 확인
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userResult = localStorage.getItem('current-user');
      if (userResult) {
        const userData = JSON.parse(userResult);
        setUser(userData);
        
        const profileResult = localStorage.getItem(`profile-${userData.username}`);
        if (profileResult) {
          setProfile(JSON.parse(profileResult));
        }
        
        const mealsResult = localStorage.getItem(`meals-${userData.username}`);
        if (mealsResult) {
          setMeals(JSON.parse(mealsResult));
        }
        
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.log('No existing user session');
    }
  };

  // 로그인
  const handleLogin = async (username, password) => {
    try {
      const result = localStorage.getItem(`user-${username}`);
      if (result) {
        const storedUser = JSON.parse(result);
        if (storedUser.password === password) {
          localStorage.setItem('current-user', JSON.stringify(storedUser));
          setUser(storedUser);
          
          const profileResult = localStorage.getItem(`profile-${username}`);
          if (profileResult) {
            setProfile(JSON.parse(profileResult));
            setCurrentView('dashboard');
          } else {
            setCurrentView('create-profile');
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // 회원가입
  const handleCreateAccount = async (username, password) => {
    try {
      const newUser = { username, password };
      localStorage.setItem(`user-${username}`, JSON.stringify(newUser));
      localStorage.setItem('current-user', JSON.stringify(newUser));
      setUser(newUser);
      setCurrentView('create-profile');
      return true;
    } catch (error) {
      return false;
    }
  };

  // 프로필 생성
  const handleCreateProfile = async (profileData) => {
    try {
      localStorage.setItem(`profile-${user.username}`, JSON.stringify(profileData));
      setProfile(profileData);
      setCurrentView('dashboard');
      return true;
    } catch (error) {
      return false;
    }
  };

  // 음식 검색 (백엔드 API 호출)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/foods/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      // 데이터 정규화 - 모든 숫자값을 안전하게 변환
      const normalizedData = data.map(food => ({
        id: food.id,
        name: food.name || 'Unknown',
        unit: food.unit || '100g',
        calories: safeNumber(food.calories),
        protein: safeNumber(food.protein),
        carbs: safeNumber(food.carbs),
        fat: safeNumber(food.fat),
        fiber: safeNumber(food.fiber),
        sugar: safeNumber(food.sugar)
      }));
      
      setSearchResults(normalizedData);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 음식을 현재 식사에 추가
  const handleAddFoodToMeal = (food, amount) => {
    const qty = safeNumber(amount, 1);
    
    const newItem = {
      id: food.id,
      name: food.name,
      amount: qty,
      unit: food.unit,
      nutrients: {
        calories: safeNumber(food.calories) * qty,
        protein: safeNumber(food.protein) * qty,
        carbs: safeNumber(food.carbs) * qty,
        fat: safeNumber(food.fat) * qty,
        fiber: safeNumber(food.fiber) * qty,
        sugar: safeNumber(food.sugar) * qty
      }
    };
    
    setCurrentMeal([...currentMeal, newItem]);
    setSelectedFood(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 식사 완료 (저장)
  const handleCompleteMeal = async () => {
    if (currentMeal.length === 0) return;
    
    const totalNutrients = currentMeal.reduce((acc, item) => {
      Object.keys(item.nutrients).forEach(nutrient => {
        acc[nutrient] = safeNumber(acc[nutrient]) + safeNumber(item.nutrients[nutrient]);
      });
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    });
    
    const newMeal = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: currentMeal,
      totalNutrients
    };
    
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    
    try {
      localStorage.setItem(`meals-${user.username}`, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Error saving meal:', error);
    }
    
    setCurrentMeal([]);
    setCurrentView('dashboard');
  };

  // 주간 데이터 계산
  const getWeeklyData = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMeals = meals.filter(meal => 
      new Date(meal.date) >= sevenDaysAgo
    );
    
    if (recentMeals.length === 0) {
      return null;
    }
    
    const totals = recentMeals.reduce((acc, meal) => {
      Object.keys(meal.totalNutrients || {}).forEach(nutrient => {
        acc[nutrient] = safeNumber(acc[nutrient]) + safeNumber(meal.totalNutrients[nutrient]);
      });
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    });
    
    return totals;
  };

  // 식사 제안
  const getSuggestions = () => {
    if (!profile || meals.length === 0) return [];
    
    const weeklyData = getWeeklyData();
    if (!weeklyData) return [];
    
    const weight = safeNumber(profile.weight, 70);
    
    const recommendations = {
      protein: weight * 1.6,
      carbs: weight * 3,
      fat: weight * 0.8,
      fiber: 25,
      sugar: 50
    };
    
    const dailyAverage = {};
    Object.keys(weeklyData).forEach(nutrient => {
      dailyAverage[nutrient] = safeNumber(weeklyData[nutrient]) / 7;
    });
    
    const deficiencies = [];
    Object.keys(recommendations).forEach(nutrient => {
      if (safeNumber(dailyAverage[nutrient]) < recommendations[nutrient]) {
        deficiencies.push(nutrient);
      }
    });
    
    const suggestions = deficiencies.map(nutrient => ({
      nutrient,
      deficit: recommendations[nutrient] - safeNumber(dailyAverage[nutrient])
    }));
    
    return suggestions;
  };

  // 로그인 뷰
  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} onCreateAccount={handleCreateAccount} />;
  }

  // 프로필 생성 뷰
  if (currentView === 'create-profile') {
    return <CreateProfileView onSubmit={handleCreateProfile} />;
  }

  // 식사 로그 뷰
  if (currentView === 'log-meal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Log Meal</h2>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* 음식 검색 */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for food (e.g., chicken, rice, apple)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map(food => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{food.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {food.unit} | {Math.round(food.calories)} cal | 
                        P: {food.protein.toFixed(1)}g | 
                        C: {food.carbs.toFixed(1)}g | 
                        F: {food.fat.toFixed(1)}g
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="mt-2 text-center text-gray-500 py-4">
                  No results found. Try a different search term.
                </div>
              )}
            </div>

            {/* 음식 추가 폼 */}
            {selectedFood && (
              <AddFoodForm
                food={selectedFood}
                onAdd={handleAddFoodToMeal}
                onCancel={() => setSelectedFood(null)}
              />
            )}

            {/* 현재 식사 아이템 */}
            {currentMeal.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Current Meal</h3>
                <div className="space-y-2">
                  {currentMeal.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-xs text-gray-500">
                          {Math.round(safeNumber(item.nutrients?.calories))} cal | 
                          P: {safeNumber(item.nutrients?.protein).toFixed(1)}g | 
                          Amount: {item.amount} {item.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = currentMeal.filter((_, i) => i !== idx);
                          setCurrentMeal(updated);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCompleteMeal}
                  className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Complete Meal Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 대시보드 뷰
  const weeklyData = getWeeklyData();
  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">ATE!</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>
          <button
            onClick={() => {
              setUser(null);
              setProfile(null);
              setMeals([]);
              localStorage.removeItem('current-user');
              setCurrentView('login');
            }}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setCurrentView('log-meal')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <PlusCircle size={32} className="mb-2" />
            <h3 className="text-xl font-bold">Log Meal</h3>
            <p className="text-green-100">Add your food intake from real database</p>
          </button>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <Target size={32} className="text-blue-600 mb-2" />
            <h3 className="text-xl font-bold text-gray-800">Total Meals</h3>
            <p className="text-3xl font-bold text-blue-600">{meals.length}</p>
          </div>
        </div>

        {/* 주간 분석 */}
        {weeklyData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="mr-2" /> Weekly Analysis
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(weeklyData).map(([nutrient, value]) => (
                <div key={nutrient} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 capitalize">{nutrient}</p>
                  <p className="text-2xl font-bold text-gray-800">{safeNumber(value).toFixed(1)}</p>
                </div>
              ))}
            </div>

            {/* 영양소 진행바 */}
            <div className="space-y-4">
              {profile && ['protein', 'carbs', 'fat'].map(nutrient => {
                const weight = safeNumber(profile.weight, 70);
                const target = nutrient === 'protein' ? weight * 1.6 :
                              nutrient === 'carbs' ? weight * 3 :
                              weight * 0.8;
                const daily = safeNumber(weeklyData[nutrient]) / 7;
                const percentage = Math.min((daily / target) * 100, 100);
                
                return (
                  <div key={nutrient}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{nutrient}</span>
                      <span>{daily.toFixed(1)}g / {target.toFixed(0)}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          percentage >= 80 ? 'bg-green-500' :
                          percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Not enough data - log meals for weekly analysis</p>
          </div>
        )}

        {/* 식사 제안 */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Apple className="mr-2" /> Nutrition Recommendations
            </h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-4">
                  <p className="font-semibold capitalize mb-2">
                    Low in {suggestion.nutrient} (deficit: {safeNumber(suggestion.deficit).toFixed(1)}g)
                  </p>
                  <p className="text-sm">Consider adding more {suggestion.nutrient}-rich foods</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 로그인 컴포넌트
const LoginView = ({ onLogin, onCreateAccount }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (isCreating) {
      const success = await onCreateAccount(username, password);
      if (!success) {
        setError('Failed to create account');
      }
    } else {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">ATE!</h1>
        <p className="text-center text-gray-600 mb-8">Track your nutrition with real data</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg transition font-semibold"
          >
            {isCreating ? 'Create Account' : 'Login'}
          </button>
        </div>
        
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setError('');
          }}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm"
        >
          {isCreating ? 'Already have an account? Login' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
};

// 프로필 생성 컴포넌트
const CreateProfileView = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'male',
    height: '',
    weight: '',
    allergies: ''
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      age: parseInt(formData.age) || 0,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Your Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({...formData, sex: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              placeholder="e.g., peanuts, shellfish"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition font-semibold"
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// 음식 추가 폼 컴포넌트
const AddFoodForm = ({ food, onAdd, onCancel }) => {
  const [amount, setAmount] = useState('1');

  const handleSubmit = () => {
    const qty = parseFloat(amount);
    if (qty > 0) {
      onAdd(food, qty);
    }
  };

  return (
    <div className="bg-green-50 p-6 rounded-lg mb-6">
      <h3 className="font-semibold text-lg mb-2">Adding: {food.name}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Unit: {food.unit} | 
        Per serving: {Math.round(safeNumber(food.calories))} cal
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (servings)
        </label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Add to Meal
        </button>
        <button
          onClick={onCancel}
          className="px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AteNutritionApp;