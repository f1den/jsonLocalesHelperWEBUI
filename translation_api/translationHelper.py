
import sys, os
from typing import Generator, Dict, Any
from googletrans import Translator, constants

try: from dsk.api import DeepSeekAPI, AuthenticationError, RateLimitError, NetworkError, APIError
except ImportError: from .dsk.api import DeepSeekAPI, AuthenticationError, RateLimitError, NetworkError, APIError

try: from yat.yandextranslatefree import YandexFreeTranslate
except ImportError: from .yat.yandextranslatefree import YandexFreeTranslate

def unimplemented(func):
    def wrapper(*args, **kwargs):
        print(f"⚠️ Warning: Function '{func.__name__}' is not implemented yet and is just a stub!")
        # raise NotImplementedError(f"Function '{func.__name__}' is not implemented yet!")
    return wrapper

class TranslationHelper():

    def __init__(self, deepseekApiToken: str, yandexApiType: str = "ios"):
        if not deepseekApiToken or not isinstance(deepseekApiToken, str):
            raise AuthenticationError("[DEEPSEEK] Invalid auth token provided")
        if not yandexApiType or not isinstance(yandexApiType, str):
            raise AuthenticationError("[YANDEX] Invalid auth token provided")

        self.deepseek = DeepSeekAPI(auth_token=deepseekApiToken)
        self.yandex = YandexFreeTranslate(api=yandexApiType)
        self.google = Translator()
    
    def _get_deepseek_response(self, chunks: Generator[Dict[str, Any], None, None]) -> None:
        """Helper function to print response chunks in a clean format"""
        thinking_lines = []
        text_content = []
        
        try:
            for chunk in chunks:
                print(chunk)
                if chunk['type'] == 'thinking':
                    if chunk['content'] and chunk['content'] not in thinking_lines:
                        thinking_lines.append(chunk['content'])
                elif chunk['type'] == 'message':
                    text_content.append(chunk['content'])
        except KeyError as e:
            print(f"❌ Error: Malformed response chunk - missing key {str(e)}")
            return

        if thinking_lines:
            print("\n🤔 Thinking:")
            for line in thinking_lines:
                print(f"  • {line}")
            print()

        response = ''.join(text_content)
        print("[DEBUG] 💬 AI Response output:")
        print(response)
        return response
    
    def _run_deepseek_chat(self, title: str, prompt: str, thinking_enabled: bool = True, search_enabled: bool = False) -> None:
        """Run a chat example with error handling"""
        # print(f"[DEBUG] \n{title}")
        # print("-" * 80)

        try:
            chunks = self.deepseek.chat_completion(
                self.deepseek.create_chat_session(),
                prompt,
                thinking_enabled=thinking_enabled,
                search_enabled=search_enabled
            )
            return self._get_deepseek_response(chunks)

        except AuthenticationError as e:
            print(f"[DEEPSEEK] ❌ Authentication Error: {str(e)}")
            print("[DEEPSEEK] Please check your authentication token and try again.")
            sys.exit(1)
        except RateLimitError as e:
            print(f"[DEEPSEEK] ❌ Rate Limit Error: {str(e)}")
            print("[DEEPSEEK] Please wait a moment before making more requests.")
        except NetworkError as e:
            print(f"[DEEPSEEK] ❌ Network Error: {str(e)}")
            print("[DEEPSEEK] Please check your internet connection and try again.")
        except APIError as e:
            print(f"[DEEPSEEK] ❌ API Error: {str(e)}")
            if e.status_code:
                print(f"[DEEPSEEK] Status code: {e.status_code}")
        except Exception as e:
            print(f"[DEEPSEEK] ❌ Unexpected Error: {str(e)}")
            print("[DEEPSEEK] Please report this issue if it persists.")



    def getDeepseekTranslation(self, text: str, prompt: str = None) -> list[str]:
        """Get multiple creative translations from DeepSeek AI.
        
        Args:
            text: The English text to translate
            prompt: Preprompt that will make AI work as expected (10 enumerated lines of russian text)
            
        Returns:
            List of 10 Russian translations following the specified format
        """
        if not text or not isinstance(text, str):
            raise ValueError("[DEEPSEEK] Invalid text provided")
        if not prompt or not isinstance(prompt, str):
            raise ValueError("[DEEPSEEK] Invalid pre-prompt provided")
        if not text.strip():
            return []
        
        try:
            full_prompt = f"{prompt}\n\nEnglish phrase: {text}"
            
            response = self._run_deepseek_chat(
                "DeepSeek AI translation",
                full_prompt,
                thinking_enabled=False
            )
            numerated_translations = response.split("\n")
            translations = [
                parts[1].strip() 
                for t in numerated_translations 
                if (parts := t.split(". ", 1)) and  # walrus operator requires Python 3.8+
                len(parts) == 2 and 
                parts[0].strip().isdigit()
            ]
            if len(translations) >= 10:
                return translations[:10]
            
            return translations + ["[Translation not available]"] * (10 - len(translations))
        
        except Exception as e:
            print(f"[DEEPSEEK] error: {str(e)}")
            return [f"DeepSeek Error: {str(e)}"]

    def getYandexTranslation(self, text, source_language: str = "en", target_language: str = "ru",) -> str:
        if not text or not isinstance(text, str):
            raise ValueError("[YANDEX] Invalid text provided")
        if not target_language or not isinstance(target_language, str):
            raise ValueError("[YANDEX] Invalid target language provided")
        if not source_language or not isinstance(source_language, str):
            raise ValueError("[YANDEX] Invalid source language provided")

        try:
            translation: str = self.yandex.translate(source_language, target_language, text)
            return translation.strip() if translation else "Yandex translation not available"
        except Exception as e:
            print(f"[YANDEX] translation error: {str(e)}")
            return "Yandex translation error"
        
    def getGoogleTranslation(self, text, source_language: str = "en", target_language: str = "ru",) -> str:
        if not text or not isinstance(text, str):
            raise ValueError("[GOOGLE] Invalid text provided")
        if not target_language or not isinstance(target_language, str):
            raise ValueError("[GOOGLE] Invalid target language provided")
        if not source_language or not isinstance(source_language, str):
            raise ValueError("[GOOGLE] Invalid source language provided")
        
        try:
            translation = self.google.translate(text=text, dest=target_language, src=source_language)
            translation_text: str = translation.text
            return translation_text.strip() if translation else "Google translation not available"
        except Exception as e:
            print(f"[GOOGLE] translation error: {str(e)}")
            return "Google translation error"
    
    @unimplemented
    def getDeeplTranslation(self, text, source_language: str = "en", target_language: str = "ru",) -> str:
        if not text or not isinstance(text, str):
            raise ValueError("[DEEPL] Invalid text provided")
        if not target_language or not isinstance(target_language, str):
            raise ValueError("[DEEPL] Invalid target language provided")
        if not source_language or not isinstance(source_language, str):
            raise ValueError("[DEEPL] Invalid source language provided")
        
        try:
            return "DeepL translation not available"
        except Exception as e:
            print(f"[DEEPL] translation error: {str(e)}")
            return "Deepl translation error"