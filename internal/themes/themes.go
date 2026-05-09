package themes

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Theme struct {
	Name   string          `json:"name"`
	Data   json.RawMessage `json:"data"`
}

func ListThemes(themesDir string) ([]Theme, error) {
	entries, err := os.ReadDir(themesDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []Theme{}, nil
		}
		return nil, err
	}

	var themes []Theme
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}
		data, err := os.ReadFile(filepath.Join(themesDir, entry.Name()))
		if err != nil {
			continue
		}
		themes = append(themes, Theme{Name: entry.Name(), Data: data})
	}
	if themes == nil {
		return []Theme{}, nil
	}
	return themes, nil
}
