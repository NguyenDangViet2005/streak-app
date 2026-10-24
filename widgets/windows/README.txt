STREAK GARDEN - Windows desktop widget

1. Install Rainmeter from https://www.rainmeter.net/
2. Extract this folder. Open PowerShell in the extracted folder.
3. Run this command (only for this downloaded script):
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Configure.ps1
4. Paste your streak URL: https://your-server/widget/your-streak-id
5. In Rainmeter: Refresh all > StreakGarden > streak ID > Streak.ini > Load.
6. Repeat step 3 for another streak to create another widget.

If your Rainmeter skins directory differs from Documents\Rainmeter\Skins:
   .\Configure.ps1 -SkinsPath 'D:\Your\Rainmeter\Skins'

Refresh: every minute while Rainmeter is running and the server is reachable.
Use HTTPS outside your trusted LAN. Data is retrieved without login.
Title / start date changes are reflected on the next successful refresh.
Deleted streaks show an unavailable message. Remove their widget in Rainmeter.
No powershell execution policy is changed permanently.
