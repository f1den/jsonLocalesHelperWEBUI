# Translation Comparison and Management Tool

A Flask-based web application for comparing JSON translation files, managing translations, and getting translation suggestions from multiple services.

## Features

- **File Comparison**:
  - DeepDiff comparison showing detailed changes between JSON files
  - Key-based comparison showing added, removed, and common keys
- **Translation Management**:
  - Side-by-side translation interface
  - Undo/redo functionality for translations
  - Bulk save all translations
- **Translation Suggestions**:
  - Yandex Translate integration
  - Google Translate integration
  - DeepL Translate integration (Not Implemented Yet)
  - DeepSeek AI suggestions
- **User Experience**:
  - Dark/light theme support (WIP)
  - Auto-resizing textareas
  - Keyboard shortcuts (Ctrl+S to save, Ctrl+Z to undo, Ctrl+Y to redo)
  - Copy functionality for quick text transfer
- **Settings**:
  - API key configuration
  - Proxy settings for translation services
  - Custom preprompt for AI suggestions

## Usage

1. Place your JSON files in the project root:
   - `ru_ru.json` (target language)
   - `en_us.json` (source language)

2. Run the application:
   ```bash
   python main.py
   ```

3. Access the tool in your browser at `http://localhost:5000`

## API Keys Configuration

The tool requires API keys for various translation services. You can configure them:

1. **Through code**: Edit the `TranslationHelper` initialization in `main.py`
2. **Through UI**: Use the Settings tab in the web interface (Not Implemented Yet)

Used services:
- DeepSeek API
- Yandex Translate
- Google Translate
- DeepL (not implemented yet)

## Keyboard Shortcuts

- **Ctrl+S**: Save all translations
- **Ctrl+Z**: Undo changes in current textarea
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo changes in current textarea

## Backup System

The application automatically creates backups in the `backups` folder before each save operation. Files are named with timestamps for easy recovery.

## Contributing

Contributions are welcome! Please open an issue or pull request for any improvements or bug fixes.

## License

[MIT License](LICENSE)
```

You may want to adjust the following based on your specific needs:

1. Add or modify the API key requirements section based on which services are mandatory
2. Update the installation instructions if you have any special setup requirements
3. Add screenshots if available
4. Include any known issues or limitations
5. Add deployment instructions if applicable

The README provides a comprehensive overview while keeping it concise and easy to follow. It covers all the main aspects of your tool including features, setup, usage, and configuration.