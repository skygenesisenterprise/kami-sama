package services

import (
	"context"
	"log/slog"
	"os"
	"testing"
)

func TestDebugAnilistTrending(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	c := NewAnilistClient(logger)
	res, err := c.GetTrendingMedia(context.Background(), "ANIME", 1, 2)
	if err != nil {
		t.Fatalf("GetTrendingMedia error: %v", err)
	}
	t.Logf("ok: %d items", len(res.Media))
}
