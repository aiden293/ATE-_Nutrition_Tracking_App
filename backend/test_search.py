#!/usr/bin/env python3
"""Test script to diagnose search issues"""
import json_db
import time

print("Loading database...")
start = time.time()
db = json_db.JsonDatabase('usda_foods.json')
print(f"Loaded in {time.time() - start:.2f}s")

print("\nSearching for 'chicken'...")
start = time.time()
results = db.search('chicken', limit=5)
print(f"Search completed in {time.time() - start:.2f}s")
print(f"Found {len(results)} results")

if results:
    print("\nFirst result:")
    first = results[0]
    print(f"  Name: {first['name']}")
    print(f"  ID: {first['id']}")
    print("\nAll keys in result:")
    for key in sorted(first.keys()):
        if key not in ['id', 'name', 'unit', 'servingOptions']:
            print(f"    {key}: {first[key]}")
else:
    print("No results found!")
