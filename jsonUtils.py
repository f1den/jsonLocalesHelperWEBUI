import json
import os
import shutil
from datetime import datetime
from deepdiff import DeepDiff


class Utils():
	def __init__(self):
		# Configuration
		self.BACKUPS_DIR = "backups"
		os.makedirs(self.BACKUPS_DIR, exist_ok=True)

	def load_json(self, filename) -> dict:
		"""Just reading json file"""
		if os.path.exists(filename):
			with open(filename, 'r', encoding='utf-8') as f:
				return json.load(f)
		return {}

	def save_json(self, filename, data) -> None:
		"""Saves json file and creates backup befor it"""
		# Sort keys alphabetically before saving
		sorted_data = {k: data[k] for k in sorted(data.keys())}
		# Create backup before saving
		self.create_backup(filename)
		with open(filename, 'w', encoding='utf-8') as f:
			json.dump(sorted_data, f, ensure_ascii=False, indent=2)

	def create_backup(self, filename) -> None:
		"""Create timestamped backup of the file"""
		if not os.path.exists(filename):
			return
			
		timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
		backup_name = f"{os.path.basename(filename)}.bak_{timestamp}"
		backup_path = os.path.join(self.BACKUPS_DIR, backup_name)
		shutil.copy2(filename, backup_path)

	def get_existing_translations(self) -> dict:
		"""Load both original and new translations with consistent sorting"""
		original = self.load_json('ru_ru.json')
		new = self.load_json('newKeys_ru_ru.json')
		
		# Merge translations (new keys override original ones) with sorted keys
		combined = {}
		for key in sorted({**original, **new}.keys()):
			combined[key] = new.get(key, original.get(key))
		
		return combined

	def compare_json_files(self, file1, file2) -> dict[str, any]:
		"""Compare two JSON files and return differences with sorted keys"""
		data1 = self.load_json(file1)
		data2 = self.load_json(file2)
		
		# DeepDiff comparison
		deep_diff = DeepDiff(data1, data2, ignore_order=True)
		
		# Simple key comparison with sorted results
		keys1 = set(data1.keys())
		keys2 = set(data2.keys())
		
		key_diff = {
			'added': sorted(list(keys2 - keys1)),  # Sort added keys
			'removed': sorted(list(keys1 - keys2)),  # Sort removed keys
			'common': sorted(list(keys1 & keys2))   # Sort common keys
		}
		
		return {
			'deep_diff': deep_diff,
			'key_diff': key_diff,
			'ru_data': data1,
			'en_data': data2
		}