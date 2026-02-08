package datetimeconverter

import (
	"fmt"
	"os"
	"strings"
)

var zoneDirs = []string{
	"/usr/share/zoneinfo/",
	"/usr/share/lib/zoneinfo/",
	"/usr/lib/locale/TZ/",
}

var excludeTzAbbrs = map[string]struct{}{
	"+VERSION": {},
}

var zoneDir string

func readTimezonesFromFile(path string, timezones *[]TimezoneInfo) {
	files, _ := os.ReadDir(zoneDir + path)
	for _, f := range files {
		if f.Name() != strings.ToUpper(f.Name()[:1])+f.Name()[1:] {
			continue
		}

		if f.IsDir() {
			readTimezonesFromFile(path+"/"+f.Name(), timezones)
		} else {
			// Exclude tz abbreviation if it's matched to any of the given list
			if _, ok := excludeTzAbbrs[f.Name()]; ok {
				continue
			}

			tzAbbr := (path + "/" + f.Name())[1:]
			label := tzAbbr
			if strings.Contains(tzAbbr, "/") {
				label = fmt.Sprintf("%s (%s)", f.Name(), tzAbbr)
			}

			*timezones = append(*timezones, TimezoneInfo{
				Label:    label,
				Timezone: tzAbbr,
			})
		}
	}
}
