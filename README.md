# Timetable for Scriptable

## Installation

Copy contents of `index.js` to **Scriptable** widget.

## Settings

In order to change settings you have to modify `settings` object in `index.js`.

Following settings are available:

| Setting | Type | Description |
| - | - | - |
| offset | `number` | Offset for timetable api |
| lang | `string` | Language group |
| wf | `string` | WF |
| background | `Color[]` | Background gradients |
| backgroundLocations | `number[]` | Background locations |
| angInf | `string` | English group |
| textColor | `Color` | Text color |
| boxColor | `Color` | Box color |
| lessonWidth | `number` | Lesson box width |
| roomPipe | `boolean` | Display room code next to hours |
| reversedOrder | `boolean` | Swap lesson name and hours |
| pipeText | `string` | Separator text if `roomPipe` is enabled. Default: `|`|