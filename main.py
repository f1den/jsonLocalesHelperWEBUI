from flask import Flask, render_template, request, jsonify

try: from translation_api.translationHelper import TranslationHelper
except ImportError: from .translation_api.translationHelper import TranslationHelper

try: from jsonUtils import Utils
except ImportError: from .jsonUtils import Utils

import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

jsonUtils = Utils()
translationHelper = TranslationHelper(deepseekApiToken=os.getenv("DEEPSEEK_API_TOKEN"), yandexApiType="ios")

TRANSLATION_PROMPT = """You are a master Russian translator specializing in creative adaptations. 
For each English phrase, provide exactly 10 Russian translations showing different approaches:

1. Literal translation
2. Idiomatic adaptation (Russian equivalent)
3. Poetic/stylized version
4. Casual/conversational
5. Formal/official
6. Shortened/simplified
7. Expanded/embellished
8. Humorous twist (if appropriate)
9. With little Easter egg based on russian films, games, etc..
10. Creative reimagining

Format strictly as:
1. Translation 1
2. Translation 2
...
10. Translation 10

Never include explanations or additional text.
"""

@app.route('/get_translation_suggestions', methods=['POST'])
def get_translation_suggestions():
    text = request.json.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    yandex = translationHelper.getYandexTranslation(text)
    google = translationHelper.getGoogleTranslation(text)
    deepl = translationHelper.getDeeplTranslation(text)

    return jsonify({
        'yandex': yandex,
        'google': google,
        'deepl': deepl,
    })

@app.route('/get_ai_suggestions', methods=['POST'])
def get_ai_suggestions():
    text = request.json.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        suggestions = translationHelper.getDeepseekTranslation(text, prompt=TRANSLATION_PROMPT)
        
        return jsonify({
            'suggestions': suggestions
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'suggestions': []
        })

@app.route('/')
def show_differences():
    ru_file = 'ru_ru.json'
    en_file = 'en_us.json'
    
    try:
        comparison = jsonUtils.compare_json_files(ru_file, en_file)
        
        # Format for DeepDiff tab (keys are already sorted)
        deep_differences = []
        if 'values_changed' in comparison['deep_diff']:
            for key in sorted(comparison['deep_diff']['values_changed'].keys()):
                change = comparison['deep_diff']['values_changed'][key]
                deep_differences.append({
                    'key': key,
                    'old_value': change['old_value'],
                    'new_value': change['new_value'],
                    'type': 'changed'
                })
                
        if 'dictionary_item_added' in comparison['deep_diff']:
            for key in sorted(comparison['deep_diff']['dictionary_item_added']):
                deep_differences.append({
                    'key': key,
                    'new_value': comparison['en_data'].get(key.split('root[')[-1][:-1], ''),
                    'type': 'added'
                })
                
        if 'dictionary_item_removed' in comparison['deep_diff']:
            for key in sorted(comparison['deep_diff']['dictionary_item_removed']):
                deep_differences.append({
                    'key': key,
                    'old_value': comparison['ru_data'].get(key.split('root[')[-1][:-1], ''),
                    'type': 'removed'
                })
        
        # Format for KeyCheck tab (keys are already sorted)
        key_differences = {
            'added': [{'key': k, 'value': comparison['en_data'][k]} for k in comparison['key_diff']['added']],
            'removed': [{'key': k, 'value': comparison['ru_data'][k]} for k in comparison['key_diff']['removed']],
            'common': comparison['key_diff']['common']
        }
        
        # Load existing translations (both original and new, already sorted)
        existing_translations = jsonUtils.get_existing_translations()
        
        return render_template('diff.html', 
                            deep_differences=deep_differences,
                            key_differences=key_differences,
                            ru_file=ru_file,
                            en_file=en_file,
                            existing_translations=existing_translations)
        
    except Exception as e:
        return render_template('error.html', error=str(e))

@app.route('/save_translations', methods=['POST'])
def save_translations():
    translations = request.json
    
    if not translations:
        return jsonify({'status': 'error', 'message': 'No translations provided'}), 400
    
    try:
        jsonUtils.save_json('newKeys_ru_ru.json', translations)
        return jsonify({'status': 'success', 'saved': len(translations)})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run()