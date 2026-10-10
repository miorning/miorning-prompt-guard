<img src="assets/floating-on.png" alt="MIORNING black cat" width="76" align="right">

# MIORNING

**Not keen on working. Surprisingly good at helping.**

A browser toolbox for AI-video creators: catch accidental submissions, keep prompts close, collect visual references and choose a style. Enable only the tools you want; let the rest nap.

**[Download v1.8.0](https://github.com/miorning/miorning-prompt-guard/releases/tag/v1.8.0)** · [简体中文](README.md) · [Tutorials (Chinese)](https://space.bilibili.com/353186187/lists/8624370) · [Report an issue](https://github.com/miorning/miorning-prompt-guard/issues)

> Free to use, including for commercial video production. **Selling the extension, paid redistribution and offering its functionality as a paid service are not permitted.** This v1.8.0 publication uses a source-available [community license](LICENSE). Previously granted MIT rights are not revoked.

![MIORNING v1.8.0 dark-mode home](docs/images/home-dark.png)

*Actual v1.8.0 interface on a controlled demo page, without private accounts or collections. The interface is currently Chinese; this English guide is documentation, not an English UI mode.*

## New in v1.8.0

It started as a safeguard against one careless keypress. Then the cat collected too many tools. This release tidies up the cabinet.

- Six optional, built-in **DLC modules**, disabled individually without deleting their data.
- An **Enter-guard website allowlist**, empty until you add your own website roots.
- An **automatic-backup switch**, enabled by default.
- A character-led **cream, charcoal and scarf-red interface**, in light and dark themes.
- Fixes for reproducible **black-dot artifacts** caused by empty bubbles and host-page pseudo-element styling.

## Core tools + six optional modules

The core includes the prompt library, saving selected webpage text, Enter confirmation on configured websites, import/export, themes and a movable floating icon.

| Module | What it does |
| --- | --- |
| Inspiration box | Region screenshots, categories, notes, previews, copy-original-image, ordering, category moves and a recycle bin. |
| Four-quadrant styles | Positive/negative emotion × high/low energy. One reference can belong to multiple quadrants. Pin an image, then copy its original or notes. |
| ShotLab canvas | F to focus, Alt+F to fit, G to group, Alt+G to ungroup, Alt+left-drag to duplicate, with individual switches. |
| Quick wheel | Assign enabled tools to four directions; classic, pastel and neon skins. |
| Banter & focus timer | Countdowns, three recent durations, snoozing and optional system quips / bedtime nudges. |
| Achievements | Four tracks and a few deliberately silly surprises. |

![DLC shelf](docs/images/dlc-dark.png)

*DLC means optional activation, not paid downloads. Modules ship in the package; no remote code is fetched. Disabling keeps your data. Styles depend on the inspiration box.*

Fresh installs enable only the core. Existing configurations retain their tools until you disable them. Inactive modules leave their shortcuts alone.

## Get started

1. Download `miorning-prompt-guard-v1.8.0.zip` from the release and extract it.
2. Open `chrome://extensions/` in Chrome, enable Developer mode and choose **Load unpacked**. Select the folder containing `manifest.json`, not the ZIP.
3. Refresh an ordinary webpage. Right-click the cat to open the toolbox. Left-click toggles the Enter guard; its hover handle moves the icon.
4. Add modules under **DLC** and websites under **设置 (Settings)**. Choose and authorize an originals folder from the inspiration box or the browser toolbar's extension popup when needed.

Other Chromium browsers may work; checks for this release used Chrome. Restricted pages such as browser settings and extension stores cannot run the injected tools. Compatibility with every browser or website is not guaranteed.

## Enter guard: your websites, your choice

![Website allowlist and backup settings](docs/images/settings-light.png)

*Automatic backup is manually disabled in this example; it is on by default.*

Under **设置 → 保险栓生效网站**, add a root URL such as `https://example.com`. A full canvas URL is normalized to its root.

- All paths on the exact host are covered, over HTTP or HTTPS.
- Add `www.example.com` and `app.example.com` separately. No wildcards.
- **The list starts empty; Enter is not intercepted until you add a website.** Check it after upgrading, too.
- In supported text editors, Enter / Ctrl+Enter opens confirmation. Shift+Enter stays a newline; active IME composition is excluded.
- Review prompts, music, subtitles, aspect ratio and duration before continuing.

This is a keyboard aid, **not a guarantee against every Generate button, custom shortcut or editor**. The list controls the Enter guard only; it does not reduce host permissions or restrict all other modules to those sites.

## Default controls

| Shortcut / action | Function |
| --- | --- |
| Backquote (&#96; / ~ key) | Toggle the Enter guard |
| Ctrl+B | Save selected webpage text |
| Alt+F1 / Alt+F2 | Capture inspiration / open the box |
| Alt+Backquote (often labeled Alt+~) | Four-quadrant style picker |
| Alt+Q | Quick wheel |
| Alt+T | Banter and timer settings |
| Esc | Close ordinary dialogs; timer alerts have their own dismiss/snooze controls |
| Hover over the cat + Tab | ShotLab settings, on its canvas with the module enabled |

Rebind global shortcuts under **设置 → 快捷键 (Shortcuts)** if they conflict with GPU software, your browser or a website. Optional-module bindings require that DLC. ShotLab-specific controls have their own settings; Ctrl+V remains native.

## Light mode, same sleepy cat

![Light-mode home](docs/images/home-light.png)

Themes carry through prompt, inspiration and style interfaces. Move the cat out of the way; its tips follow and stay within the visible webpage where possible.

## Backups and originals are separate

- Configuration lives in extension storage. Reference originals live in browser storage or your authorized folder.
- Exports include prompts, notes, settings, thumbnails, achievements and the originals-folder name, **not the reference originals**. Copy those separately when moving computers and authorize the new folder.
- Backup is **on by default**, once per local calendar day while the browser runs. It prefers `MIORNING-自动备份` inside the originals directory, falling back to the same subfolder in browser Downloads if necessary. It does not run while the computer or browser is fully off.
- Import **replaces** current configuration and inspiration records; it does not merge. Back up first.
- Backups are **unencrypted JSON** and can contain private prompts or thumbnails. Do not publish them accidentally.
- Folder access is browser-controlled and can need renewed authorization. The extension cannot bypass disk-permission rules.

## Upgrade safely

1. Export the old configuration and keep the original images.
2. Replace extension files in the **same previously loaded folder**.
3. Reload the extension in the browser's extensions page, then refresh webpages.
4. Check the website list, modules and folder permission.

**Do not uninstall first.** A different load path can create a new extension ID without the old data. Import your backup and authorize the image folder if that happens. Do not enable two copies at once.

## Privacy, permissions and checks

There is no account service, cloud sync or telemetry uploader in this release. Prompts and screenshots are handled locally. Author/tutorial links open their external websites when used.

Permissions cover website injection, clipboard access, storage, offscreen image processing, alarms and downloads. The Enter list is **not a replacement for browser permission controls**; only install sources and packages you trust.

The release passed 22 controlled Chrome UI checks and 25 background-logic checks. Actual content scripts were exercised with mocked extension APIs; **this is not end-to-end certification of all real websites, disk permissions, downloads or browser lifecycles**. See [TEST-REPORT.txt](TEST-REPORT.txt).

## License and creator

You may use and modify the tool, share it free of charge, and use it for paid video work or internal business workflows. You may not sell the extension or modified versions, charge for downloads/access, or package its functionality as a paid service. Independent video production, teaching and consulting are not forbidden merely because they use or explain the tool.

[MIORNING Community License 1.0](LICENSE) is source-available, **not an OSI-approved open-source license**. Previous MIT releases and code lawfully received under MIT retain their rights; the [legacy MIT notice](licenses/LEGACY-MIT.txt) is not an alternative for the entire new release. The full license controls over this summary.

By [Miorning 喵咛](https://space.bilibili.com/353186187) · [Tutorials](https://space.bilibili.com/353186187/lists/8624370) · [Changelog](CHANGELOG.md) · [Release history](https://github.com/miorning/miorning-prompt-guard/releases)

> Waste fewer credits. Make fewer silly mistakes. Then go get some sleep.
