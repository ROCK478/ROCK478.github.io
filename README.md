# Личный сайт Виктора

Сайт: https://rock478.github.io/

Статический сайт без зависимостей и этапа сборки. GitHub Pages публикует корень ветки `main`.

## Редактирование

- `index.html` — тексты, разделы и ссылки.
- `styles.css` — оформление и адаптация для телефона.
- `favicon.svg` — иконка вкладки.

## Локальный просмотр

В папке проекта выполнить:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Открыть http://127.0.0.1:8000/ . Остановить сервер: Ctrl+C.

## Публикация изменений

```sh
git add index.html styles.css favicon.svg
git commit -m "Update personal site"
git push origin main
```

GitHub Pages автоматически опубликует изменения. Статус: https://github.com/ROCK478/ROCK478.github.io/actions
