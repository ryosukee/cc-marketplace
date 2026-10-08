# CCM-T20 slide comparison prototype

Discarded comparison prototype, not an adopted plugin implementation. Four slides share the content in [content.json](./content.json), palette and layout in [theme.css](./theme.css), and chrome in [wrapper.css](./wrapper.css). No source video was reconstructed.

The three published files use dependency-free HTML/CSS/JS, Marp CLI 4.5.1 with its real Bespoke template, and Reveal.js 6.0.2. Their generators keep scripts, styles and third-party license notices inside each HTML file. System fonts need no download. [LICENSE](./LICENSE) retains the installed packages' full license notices, including Marp's Bespoke bundle notices.

## Reproduce

Install exact engines in the scratch directory, without a global install:

```sh
npm install --prefix /tmp/html-communication-research/slides-deps --no-save --package-lock=false @marp-team/marp-cli@4.5.1 reveal.js@6.0.2
node /Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace-html-slides-prototype/prototypes/t20-slides/build.mjs
node /Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace-html-slides-prototype/prototypes/t20-slides/capture.mjs
node /Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace-html-slides-prototype/prototypes/t20-slides/check-navigation.mjs
```

[build.mjs](./build.mjs) derives [slides.md](./slides.md) from the JSON and invokes the real Marp CLI; generated HTML is not edited by hand. Scratch output is `/tmp/html-communication-research/slides-demos`. Marp's primary file is `marp.html` using Bespoke; `marp-reading.html` is a secondary bare-template comparison.

[capture.mjs](./capture.mjs) uses the existing Playwright module at `/Users/ryosuke/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs`. Override `HTML_COMMUNICATION_PLAYWRIGHT_MODULE` if needed. `T20_DEPS` overrides the engines' node_modules path and `T20_OUT` overrides scratch output. Chromium is required.

`build.mjs --publish-reserved` additionally writes only the three existing reservations under `/Users/ryosuke/.local/share/claude-html-communication`: `ccm-r017.html`, `ccm-r018.html`, and `ccm-r019.html`. It restores read-only file permissions and records actual bytes and SHA256 values in [published-artifacts.json](./published-artifacts.json). The return link to `ccm-f115.html` is resolved in that shared directory; it is not a scratch fixture.

## Engine features and prototype additions

| Example | Engine or browser capability | Additional prototype code |
| --- | --- | --- |
| Native HTML | Browser HTML, CSS and native dialog | Slide navigation, responsive reading layout, dialog wiring and focus return |
| Marp | Marpit rendering, Bespoke navigation and transition, built-in overview/presenter, browser details expansion inside HTML-enabled Markdown | Custom theme, comparison chrome, complete detail appendix for print and JavaScript-off reading |
| Reveal | Slide navigation, fragment, Auto-Animate, built-in overview | Custom theme, dialog wiring, comparison chrome, print/JavaScript-off appendix; below 701px, custom reading CSS without initializing Reveal |

The Marp primary has no custom overlay JavaScript. Its HTML `details` opens inline with Enter, including when JavaScript is disabled. In the pure Bespoke runtime, Space while the summary is focused advances to slide 3 rather than opening details; this conflict is intentionally recorded, not patched. Closed details' full text is also supplied in the wrapper appendix.

Native and Reveal dialog samples use [detail.js](./detail.js), not the current html-communication template. Enter opens them, Escape closes them and returns focus to the trigger. Reveal keyboard handling is suspended during the custom dialog. The native deck uses [native.js](./native.js); Reveal's configuration is [reveal-init.js](./reveal-init.js).

Reveal's third slide reveals one fragment, then its fourth slide moves and enlarges the matched code container through standard Auto-Animate. Neither demonstration means a difference-animation feature has been selected for the plugin. Existing overview/presenter capabilities remain visible for a fair comparison; no custom overview, autoplay or narration feature was added.

## Measured limits

[verification.json](./verification.json) records 23 successful result groups in Chromium: the three engines at 1440px and 390px in light/dark mode, keyboard examples, and six offline JavaScript-on/off print checks. Screenshots remain in the scratch output directory. Fragment screenshots wait 900ms after reveal and record final color, opacity, filter and ancestor styles; Auto-Animate screenshots include before, in-progress and settled states.

At 390px, native and Reveal use custom vertical reflow with 19px lead text. This is not Reveal's standard Scroll View. Marp remains a scaled 1280×720 slide: 24px lead text is approximately 7.31px on screen, making the reading limitation visible. Desktop canvas scales are approximately 1.056 for native/Marp and 1.06 for Reveal.

All observed non-file network requests were zero. JavaScript-off reading exposes all four slides and the detail appendix; CSS print emulation exposes them as well. Actual PDF export, printer pagination, other browsers and integration into the current shared template were not tested.

Native now reacts to width changes without reloading. Below 701px it shows all four slides for reading; widening restores the selected slide and navigation. Native's arrow keys also work while a navigation button is focused; first/last navigation buttons are disabled at the corresponding boundary.

[check-navigation.mjs](./check-navigation.mjs) checks the published native HTTPS page with actual previous/next button clicks, arrow keys, dialog suspension and repeated 390px/1440px changes in both directions, in light/dark mode from both initial widths. [navigation-verification.json](./navigation-verification.json) records four result groups. Set `T20_NAV_BASE` to test another directory containing the same reserved filenames. The earlier 23 groups tested file-based keyboard navigation and initial widths; they did not cover served button clicks or width changes.

Reveal's reading mode remains chosen on load. Initial desktop button navigation works in Chromium, but widening a page loaded below 701px leaves Reveal uninitialized. Reload at the desired width before trying navigation. A destroy/reinitialize attempt did not pass the resize checks (slides were hidden after returning to reading, and a restored deck lacked a current index); it was reverted rather than retaining unstable behavior. This limitation remains unresolved, following the user's instruction not to spend more effort if a simple fix fails.
