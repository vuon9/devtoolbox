package service

import (
	"context"
	"devtoolbox/internal/themes"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type ThemesService struct {
	app       *application.App
	themesDir string
}

func NewThemesService(app *application.App, themesDir string) *ThemesService {
	return &ThemesService{
		app:       app,
		themesDir: themesDir,
	}
}

func (s *ThemesService) ServiceStartup(ctx context.Context, opts application.ServiceOptions) error {
	return nil
}

func (s *ThemesService) ServiceShutdown() error {
	return nil
}

func (s *ThemesService) List() ([]themes.Theme, error) {
	return themes.ListThemes(s.themesDir)
}
