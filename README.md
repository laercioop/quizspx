# Quizz Festa de São Pio X — 1ª Edição

Web app estático, mobile-first e sem dependências. Para testar localmente:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8765/`. O banco `questions.js` é gerado a partir de `respostasv-2.txt` por `node build-data.js`.
