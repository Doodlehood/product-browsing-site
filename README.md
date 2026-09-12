# Product Browser

A single-page app in plain HTML, CSS, and JavaScript that loads products from
[dummyjson.com/products](https://dummyjson.com/products), and lets you search,
sort, and favourite them.

## Files

- `index.html` — page structure (search box, sort dropdown, favourites toggle, grid)
- `style.css` — styling, including a mobile-friendly responsive grid
- `script.js` — data loading, filtering, sorting, and favourites logic

## How to run it

Just open `index.html` in a browser. No build step or server needed (the API
call works fine straight off the file system in most browsers; if your browser
blocks `fetch` from a `file://` page, serve the folder with something like
`npx serve` or `python3 -m http.server` and open it over `http://localhost`).

## How the fetch works

On page load, `loadProducts()` calls `fetch()` against
`https://dummyjson.com/products?limit=100` inside a `try/catch`, using
`await` so the code reads top-to-bottom instead of nesting callbacks. While
the request is in flight, a "Loading..." message is shown. If the response
comes back with a bad status code, or the request fails outright (e.g. no
internet), we throw/catch an error and swap the message for a friendly
"couldn't load the products" note instead of leaving a blank screen. On
success, the JSON is parsed and the `products` array is stored in the
`allProducts` variable, which is treated as the single source of truth for
the whole app and never mutated afterwards.

## How the search works

The search input has an `input` event listener that fires on every keystroke.
Rather than filtering and re-rendering the original array directly, there's
one `getVisibleProducts()` function that takes `allProducts` and applies,
in order: the search filter (case-insensitive `includes()` match against the
title), the "favourites only" filter (if toggled on), and the selected sort
order. `render()` calls this function and rebuilds the grid from whatever
comes out. Keeping `allProducts` untouched and re-deriving the visible list
each time means search, sorting, and the favourites toggle can all be combined
without stepping on each other, and the grid always reflects the current
combination of filters.

## Favourites

Favourites are tracked with a `Set` of product IDs, kept only in memory (no
`localStorage`), so favouriting a card adds its ID to the set, and clicking
again removes it. The count in the top bar and the "Show favourites only"
view both just read from the same set, so everything stays in sync
automatically whenever `render()` runs.

## Notes

- Favourites are not persisted between page reloads — this was kept simple
  on purpose, but adding `localStorage` would be a small extension if needed.
- The optional "sort by price" and "show favourites only" features from the
  brief are both included.
