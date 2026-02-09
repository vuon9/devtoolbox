package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestJWTService_Delegation(t *testing.T) {
	svc := NewJWTService(nil)

	t.Run("Decode invalid token", func(t *testing.T) {
		resp, err := svc.Decode("invalid.token")
		assert.NoError(t, err) // Service returns error inside response, not as go error
		assert.False(t, resp.Valid)
		assert.NotEmpty(t, resp.Error)
	})

	t.Run("Verify empty token", func(t *testing.T) {
		resp, err := svc.Verify("", "secret", "utf8")
		assert.NoError(t, err)
		assert.False(t, resp.Valid)
		assert.Contains(t, resp.Error, "Token cannot be empty")
	})
}
