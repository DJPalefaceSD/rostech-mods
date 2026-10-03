# 🛢️ Oil

Gas Gauge's neighbour. A band above the prompt that shows this week's Fable use.

## What it shows

- **Fable's token count this week.** Oil counts every model response itself, the main thread and subagents alike, and adds up the ones Fable answered. Cache reads are left out.
- **The week** runs to your plan's weekly refill, read off the same window Gas Gauge reads.
- **Your Fable limit, when it can.** Claude plans have a separate weekly limit for Fable. Claude Code does not yet give that window to plugins, so Oil says so instead of guessing. If it ever arrives, Oil draws it as a gauge, like Gas Gauge.

## Commands

- `/oil` prints the numbers.
- `/oil hide` moves it to the status line. `/oil show` brings the band back.

## Privacy

Everything stays on your machine: a count in the plugin's own store. Nothing is sent anywhere.
