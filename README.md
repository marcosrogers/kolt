# kolt: Koha Offline Library Tool

This tool is a standalone webpage that can create a Koha offline circulation file (.koc) when your internet connection is down.

## Installation
To install, download `kolt.html` to your desktop. That's it!

## Usage
To use this tool, scan item barcodes and library cards like normal with your cursor in the correct text field. This tool doesn't do payments, or "holds" information, as these require an internet connection to access the database. It only handles basic check-in and check-out functionality. This tool will save the data to the local browser cache until either the cache is cleared, or you click the "Clear" button. When this happens the data cannot be recovered, so make sure you have exported the data using the "Download Data" button first!

### Patron Search
You can search for patrons by name to quickly look up their information. Before using the patron search feature, you'll need to download the `patrons.db` file from your Koha system. This file can be generated running `create_koc_db.pl` as a cron job . **Important:** Download this file while you still have internet access, as you won't be able to access it once Koha is unavailable.

To search for a patron:
- Type the patron's name or barcode in the search field
- If one patron matches your search, their barcode will automatically populate and you'll be ready to check out books
- If multiple patrons match, a list will appear. Click on the row of the patron you want to select, and their barcode will automatically fill in

This makes it easy to find the right patron without needing to scan their library card.

### Saving Circulation to Koha

This tool does **not** save data to Koha automatically. Rather, it generates a Koha offline circulation file (.koc) that needs to be uploaded to Koha once it's online again. To upload the .koc file:
- Click the "Download Data (.koc)" button. (You can name the file whatever you would like; by default it uses the current date and time on the computer.)
- Next, log-in to Koha through the staff interface and click on "Circulation." 
- Then click on "Upload offline circulation file (.koc)" at the bottom of the screen.
- Select your file using the "Choose File" button.
- Click "Upload File" then "Add to offline circulation queue."
- From there click "View pending offline circulation actions," then "Check all," then "Process."

If you don't see some of these options in Koha, you may not have the necessary permissions. In that case email the file to your system administrator, or someone on your team with "Super Libarian" permissions.

## Compatibility
This tool was developed for the Chrome Web Browser on Linux Mint 21.3 Cinnamon, but should work with most browsers on most operating systems.

| OS | Chrome | Firefox | Edge |
|---|---|---|---|
| Linux Mint | ✅ | ✅ | N/A |
| Ubuntu Linux | ✅ | ❓ | N/A |
| Windows 10 | ✅ | ❓ | ✅ |

## Contributors
kolt v0.1 created by Kendall Purser
for the [Bonneville County Library District](https://bcld.org)
and the [Library Consortium of Eastern Idaho](https://lcei.lili.org/)

Modified by Sam Sowanick, Mark Rogers

&copy; 2026