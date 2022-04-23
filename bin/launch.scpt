on run argv
    set version to item 1 of argv
	set content to item 2 of argv
	tell application "Adobe After Effects 2021"
		DoScript content
	end tell
end run
