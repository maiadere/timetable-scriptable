# Timetable for Scriptable

## Installation

Copy contents of `index.js` to **Scriptable** widget.

## Settings

In order to change settings you have to modify `settings` object in `index.js`.

Following settings are available:

| Setting | Type | Description |
| - | - | - |
| offset | `number` | Offset for timetable api |
| lang | `string` | Language group (gr1n, gr2n, gr3n, gr4r) |
| wf | `string` | WF (CH, DZ) |
| background | `Color[]` | Background gradients |
| backgroundLocations | `number[]` | Background locations |
| angInf | `string` | English group (gr1, gr2) |
| textColor | `Color` | Text color |
| boxColor | `Color` | Box color |
| lessonWidth | `number` | Lesson box width |
| roomPipe | `boolean` | Display room code next to hours |
| reversedOrder | `boolean` | Swap lesson name and hours |
| pipeText | `string` | Separator text if `roomPipe` is enabled. Default: `\|`|
| hidePastLessons | `boolean` | hide lessons that already passed on ExL widget |
| preloadNextWeekOnSunday | `boolean` | shows next week on sunday on ExL widget |
| exlLogo | `int` | 1 for icons only, 2 for text + icon |
| dev | `boolean` | presents widget in scriptable editor |