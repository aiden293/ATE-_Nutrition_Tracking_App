#!/usr/bin/env python3
"""
JSON Database module for ATE Nutrition Tracking App
Equivalent to jsonDb.js - handles USDA FDC JSON format
"""

import json

# USDA FDC Nutrient Code Mapping
NUTRIENT_CODE_MAP = {
    208: 'calories',
    203: 'protein',
    205: 'carbs',
    204: 'fat',
    291: 'fiber',
    269: 'sugar',
    301: 'calcium',
    303: 'iron',
    304: 'magnesium',
    305: 'phosphorus',
    306: 'potassium',
    307: 'sodium',
    309: 'zinc',
    320: 'vitaminA',
    401: 'vitaminC',
    328: 'vitaminD',
    323: 'vitaminE',
    430: 'vitaminK',
    415: 'vitaminB6',
    418: 'vitaminB12',
    417: 'folate',
    406: 'niacin'
}


class JsonDatabase:
    """JSON-based food database using USDA FDC format"""
    
    def __init__(self, json_file_path):
        """Initialize database from JSON file"""
        self.foods = []
        self.load_from_file(json_file_path)
    
    def load_from_file(self, json_file_path):
        """Load foods from JSON file"""
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Handle different JSON structures
                if isinstance(data, list):
                    self.foods = data
                elif isinstance(data, dict) and 'foods' in data:
                    self.foods = data['foods']
                elif isinstance(data, dict) and 'FoundationFoods' in data:
                    self.foods = data['FoundationFoods']
                else:
                    self.foods = []
                
                print(f"Loaded {len(self.foods)} foods from JSON database")
        except FileNotFoundError:
            print(f"JSON file not found: {json_file_path}")
            self.foods = []
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            self.foods = []
        except Exception as e:
            print(f"Error loading JSON database: {e}")
            self.foods = []
    
    def _extract_nutrient(self, food, nutrient_code):
        """Extract nutrient value from food object"""
        nutrients = food.get('foodNutrients', [])
        for nutrient in nutrients:
            # Handle different field names
            nutrient_id = nutrient.get('nutrientId') or nutrient.get('nutrient', {}).get('id')
            # Also handle 'number' field (as string)
            if not nutrient_id:
                nutrient_number = nutrient.get('nutrient', {}).get('number')
                if nutrient_number:
                    try:
                        nutrient_id = int(nutrient_number)
                    except (ValueError, TypeError):
                        pass
            
            if nutrient_id == nutrient_code:
                amount = nutrient.get('amount') or nutrient.get('value', 0)
                return float(amount) if amount is not None else 0.0
        return 0.0
    
    def _normalize_food(self, food):
        """Convert USDA food format to app format"""
        # Extract basic info
        food_id = food.get('fdcId') or food.get('fdc_id') or food.get('id', 0)
        description = food.get('description') or food.get('name', 'Unknown Food')
        
        # Build normalized food object with both static and food-specific serving options
        normalized = {
            'id': food_id,
            'name': description,
            'unit': '100 g',
            'servingOptions': [
                {'label': 'grams', 'unit': 'g', 'gramsPerUnit': 1, 'gramWeight': 1},
                {'label': 'oz', 'unit': 'oz', 'gramsPerUnit': 28.35, 'gramWeight': 28.35},
                {'label': 'lb', 'unit': 'lb', 'gramsPerUnit': 453.59, 'gramWeight': 453.59},
                {'label': 'serving (100g)', 'unit': 'serving', 'gramsPerUnit': 100, 'gramWeight': 100},
            ]
        }
        
        # Extract all nutrients using the mapping
        for code, name in NUTRIENT_CODE_MAP.items():
            normalized[name] = self._extract_nutrient(food, code)
        
        # Add food-specific serving options from foodPortions
        portions = food.get('foodPortions', [])
        for portion in portions:
            label = portion.get('label') or portion.get('portionDescription') or portion.get('modifier') or 'serving'
            amount = portion.get('amount', 1.0)
            gram_weight = portion.get('gramWeight', 100.0)
            
            serving_option = {
                'label': f"{amount} {label}" if amount != 1.0 else label,
                'unit': label,
                'amount': amount,
                'gramWeight': gram_weight,
                'gramsPerUnit': gram_weight / amount if amount > 0 else gram_weight,
                'modifier': portion.get('modifier', ''),
                'description': portion.get('portionDescription', '')
            }
            normalized['servingOptions'].append(serving_option)
        
        return normalized
    
    def search(self, query, limit=20):
        """Search foods by text query - matches all words in any order"""
        if not query:
            return []
        
        query_lower = query.lower().strip()
        # Split query into words for flexible matching
        query_words = query_lower.split()
        results = []
        
        for food in self.foods:
            description = food.get('description', '') or food.get('name', '')
            description_lower = description.lower()
            
            # Check if all query words are present in the description
            if all(word in description_lower for word in query_words):
                results.append(self._normalize_food(food))
                if len(results) >= limit:
                    break
        
        return results
    
    def get_by_id(self, food_id):
        """Get food by ID"""
        for food in self.foods:
            fdc_id = food.get('fdcId') or food.get('fdc_id') or food.get('id')
            if fdc_id == food_id:
                return self._normalize_food(food)
        return None
    
    def get_all(self, limit=50):
        """Get all foods (limited)"""
        results = []
        for food in self.foods[:limit]:
            results.append(self._normalize_food(food))
        return results


# Standalone test function
def test_json_db():
    """Test the JSON database"""
    import os
    
    # Try to find JSON file
    json_file = os.path.join(os.path.dirname(__file__), 'usda_foods.json')
    
    if not os.path.exists(json_file):
        print(f"JSON file not found: {json_file}")
        print("Please create a usda_foods.json file with USDA FDC data")
        return
    
    # Initialize database
    db = JsonDatabase(json_file)
    
    # Test search
    print("\nTesting search for 'spinach':")
    results = db.search('spinach', limit=3)
    for food in results:
        print(f"  - {food['name']}")
        print(f"    Calories: {food['calories']}, Protein: {food['protein']}g")
        print(f"    Iron: {food['iron']}mg, Potassium: {food['potassium']}mg")
    
    print("\nTesting search for 'banana':")
    results = db.search('banana', limit=3)
    for food in results:
        print(f"  - {food['name']}")
        print(f"    Calories: {food['calories']}, Carbs: {food['carbs']}g")
        print(f"    Potassium: {food['potassium']}mg")


if __name__ == '__main__':
    test_json_db()
