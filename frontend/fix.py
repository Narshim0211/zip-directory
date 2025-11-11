from pathlib import Path
path = Path('src/components/NotificationsPage.jsx')
text = path.read_text(encoding='utf-8')
text = text.replace('Loading�', 'Loading…')
path.write_text(text, encoding='utf-8')
