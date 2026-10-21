# Anime Filler List Data

An open dataset classifying every episode of 45 flagship anime as **Canon**, **Filler**, or **Mixed** — 9,552 episodes total. Curated to the longest-running, most-searched series (One Piece, Naruto, Bleach, Detective Conan, Dragon Ball, and 40 others) rather than every anime skipthefiller.com covers.

Maintained alongside [SkipTheFiller](https://skipthefiller.com), a filler-guide site covering these same anime with per-episode detail, arc breakdowns, and a [filler-time calculator](https://skipthefiller.com/filler-calculator). This repo is a static snapshot export of that data, not a live feed — check skipthefiller.com for the current, continuously-updated version.

## Files

- **`anime.json`** — one entry per anime (slug, title, genres, studio, episode counts) with its episodes nested underneath.
- **`episodes.csv`** — the same data flattened to one row per episode, for anyone who'd rather load it into a spreadsheet or a dataframe than parse nested JSON.
- **`news.json`** — short factual news summaries per anime (season announcements, casting, adaptation news), keyed by slug. Summaries, not full articles.
- **`characters.json`** — characters per anime (role, faction/group, tags, vote counts), keyed by anime slug.
- **`voice-actors.json`** — voice actors appearing across these anime, deduped by actor, with every character/anime/language they're credited for.

## Schema

Each anime entry:

| field | type | notes |
|---|---|---|
| `slug` | string | matches the URL slug on skipthefiller.com, e.g. `one-piece` → `skipthefiller.com/one-piece-filler-list` |
| `title` | string | |
| `genres` | string[] | |
| `studio` | string \| null | |
| `premiered` | string \| null | e.g. `"Fall 2013"` |
| `status` | string | `Ongoing` or `Completed` |
| `totalEpisodes` | number | |
| `canonCount` / `fillerCount` / `mixedCount` | number | |
| `url` | string | the specific skipthefiller.com page for this anime |
| `episodes` | array | see below |

Each episode entry:

| field | type | notes |
|---|---|---|
| `number` | number | |
| `title` | string | |
| `type` | `"Canon"` \| `"Filler"` \| `"Mixed"` | `Mixed` = canon and filler content in the same episode |
| `arc` | string \| null | |
| `airDate` | string (`YYYY-MM-DD`) \| null | |

`news.json` is keyed by anime slug; each entry is `{ url, items }`, where each item is `{ id, title, date, summary, tag }`.

`characters.json` is keyed by anime slug; each entry is an array of `{ name, slug, role, group, tags, firstEp, powerfulVotes, villainVotes, goatVotes, url }`. No biography/description text — facts only, same principle as `news.json`.

`voice-actors.json` is a flat array of `{ name, slug, nationality, debutYear, url, roles }`, where `roles` is `[{ anime, character, language, since }]` — one voice actor can have multiple roles if they're credited across more than one of the anime in this dataset. No biography text, same reasoning.

## Anime covered

| Anime | Episodes | Canon | Filler | Mixed |
|---|---|---|---|---|
| [Ace of Diamond](https://skipthefiller.com/ace-of-diamond-filler-list) | 191 | 184 | 5 | 2 |
| [Attack on Titan](https://skipthefiller.com/attack-on-titan-filler-list) | 94 | 88 | 0 | 6 |
| [Black Clover](https://skipthefiller.com/black-clover-filler-list) | 170 | 145 | 18 | 7 |
| [Bleach](https://skipthefiller.com/bleach-filler-list) | 408 | 204 | 163 | 41 |
| [Blue Exorcist](https://skipthefiller.com/blue-exorcist-filler-list) | 73 | 58 | 10 | 5 |
| [Bobobo-bo Bo-bobo](https://skipthefiller.com/bobobo-bo-bobo-filler-list) | 76 | 76 | 0 | 0 |
| [Boruto: Naruto Next Generations](https://skipthefiller.com/boruto-filler-list) | 293 | 134 | 143 | 16 |
| [Cardcaptor Sakura](https://skipthefiller.com/cardcaptor-sakura-filler-list) | 93 | 60 | 33 | 0 |
| [A Certain Magical Index](https://skipthefiller.com/certain-magical-index-filler-list) | 74 | 74 | 0 | 0 |
| [D.Gray-man](https://skipthefiller.com/d-gray-man-filler-list) | 116 | 88 | 25 | 3 |
| [Detective Conan](https://skipthefiller.com/detective-conan-filler-list) | 1209 | 637 | 571 | 1 |
| [Digimon Adventure](https://skipthefiller.com/digimon-adventure-filler-list) | 104 | 104 | 0 | 0 |
| [Dr. Stone](https://skipthefiller.com/dr-stone-filler-list) | 94 | 94 | 0 | 0 |
| [Dragon Ball](https://skipthefiller.com/dragon-ball-filler-list) | 153 | 102 | 41 | 10 |
| [Dragon Ball Super](https://skipthefiller.com/dragon-ball-super-filler-list) | 131 | 114 | 14 | 3 |
| [Dragon Ball Z](https://skipthefiller.com/dragon-ball-z-filler-list) | 291 | 244 | 38 | 9 |
| [Fairy Tail](https://skipthefiller.com/fairy-tail-filler-list) | 328 | 256 | 61 | 11 |
| [Fist of the North Star](https://skipthefiller.com/fist-of-the-north-star-filler-list) | 152 | 118 | 20 | 14 |
| [Food Wars! Shokugeki no Soma](https://skipthefiller.com/food-wars-filler-list) | 86 | 86 | 0 | 0 |
| [Gintama](https://skipthefiller.com/gintama-filler-list) | 367 | 340 | 23 | 4 |
| [Haikyu!!](https://skipthefiller.com/haikyuu-filler-list) | 85 | 85 | 0 | 0 |
| [Hajime no Ippo](https://skipthefiller.com/hajime-no-ippo-filler-list) | 127 | 124 | 2 | 1 |
| [Hunter x Hunter (2011)](https://skipthefiller.com/hunter-x-hunter-filler-list) | 148 | 145 | 2 | 1 |
| [Inuyasha](https://skipthefiller.com/inuyasha-filler-list) | 167 | 121 | 31 | 15 |
| [JoJo's Bizarre Adventure](https://skipthefiller.com/jojos-bizarre-adventure-filler-list) | 191 | 191 | 0 | 0 |
| [Katekyo Hitman Reborn!](https://skipthefiller.com/katekyo-hitman-reborn-filler-list) | 203 | 165 | 30 | 8 |
| [Kingdom](https://skipthefiller.com/kingdom-filler-list) | 155 | 155 | 0 | 0 |
| [Kuroko's Basketball](https://skipthefiller.com/kuroko-no-basketball-filler-list) | 75 | 75 | 0 | 0 |
| [Monster](https://skipthefiller.com/monster-filler-list) | 74 | 74 | 0 | 0 |
| [My Hero Academia](https://skipthefiller.com/my-hero-academia-filler-list) | 138 | 129 | 4 | 5 |
| [Naruto](https://skipthefiller.com/naruto-filler-list) | 220 | 74 | 90 | 56 |
| [Naruto: Shippuden](https://skipthefiller.com/naruto-shippuden-filler-list) | 500 | 233 | 203 | 64 |
| [One Piece](https://skipthefiller.com/one-piece-filler-list) | 1173 | 1036 | 94 | 43 |
| [Pokémon](https://skipthefiller.com/pokemon-filler-list) | 276 | 44 | 125 | 107 |
| [Ranma ½](https://skipthefiller.com/ranma-1-2-filler-list) | 161 | 77 | 71 | 13 |
| [Rurouni Kenshin](https://skipthefiller.com/rurouni-kenshin-filler-list) | 95 | 51 | 43 | 1 |
| [Sailor Moon](https://skipthefiller.com/sailor-moon-filler-list) | 200 | 85 | 98 | 17 |
| [That Time I Got Reincarnated as a Slime](https://skipthefiller.com/slime-isekai-filler-list) | 75 | 69 | 3 | 3 |
| [Sword Art Online](https://skipthefiller.com/sword-art-online-filler-list) | 96 | 96 | 0 | 0 |
| [The Seven Deadly Sins](https://skipthefiller.com/the-seven-deadly-sins-filler-list) | 100 | 91 | 4 | 5 |
| [Urusei Yatsura (1981)](https://skipthefiller.com/urusei-yatsura-1981-filler-list) | 167 | 134 | 20 | 13 |
| [Yowamushi Pedal](https://skipthefiller.com/yowamushi-pedal-filler-list) | 137 | 135 | 0 | 2 |
| [Yu-Gi-Oh!](https://skipthefiller.com/yu-gi-oh-filler-list) | 224 | 152 | 57 | 15 |
| [Yu Yu Hakusho](https://skipthefiller.com/yu-yu-hakusho-filler-list) | 112 | 108 | 0 | 4 |
| [Zatch Bell!](https://skipthefiller.com/zatch-bell-filler-list) | 150 | 121 | 29 | 0 |

## License

[CC BY 4.0](LICENSE) — use it for anything, including commercial projects, as long as you credit the source. Attribution should link to [skipthefiller.com](https://skipthefiller.com).

## Snapshot date

2026-08-19. This is a point-in-time export — new episodes air and classifications get corrected over time on the live site, which this repo does not automatically track.
