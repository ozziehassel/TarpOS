# TarpOS Docs
Official documentation for TarpOS system use and manipulation.

## Commands
Commands are entered as `COMMANDHERE ARGUMENT1 ARGUMENT2 ARGUMENT3`
- <b>savefile</b> - Write file to specified directory - `savefile FILENAME DIRECTORY FILETYPE DATA`
- <b>fetchsystemdata</b> - Returns system data in JSON format - `fetchsystemdata`
- <b>dir</b> - Returns directory contents as an array  - `dir DIRECTORY`
- <b>run</b> - Runs specified program - `run PROGRAM`
- <b>readfile</b> - Returns contents of specified file - `reafile FILENAME ENCODING FLAG` 
- <b>requestrestart</b> - Asks user if they would like reboot - `requestreboot`
- <b>setsettings</b> - Sets system settings and reboots- `setsettings DEFAULTWINDOWHEIGHT DEFAULTWINDOWWIDTH GLOBALFONT`
