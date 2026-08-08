package services

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/gorm"
)

var slugNonAlpha = regexp.MustCompile(`[^a-z0-9]+`)

func generateSlug(input string) string {
	slug := strings.ToLower(strings.TrimSpace(input))
	slug = slugNonAlpha.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "untitled"
	}
	return slug
}

// uniqueSlug returns a slug that is not already used by an existing anime row
// (including soft-deleted rows, since the slug unique constraint applies to them too).
func uniqueSlug(ctx context.Context, db *gorm.DB, base string) string {
	slug := base
	for i := 2; ; i++ {
		var count int64
		db.WithContext(ctx).Unscoped().Model(&models.Anime{}).Where("slug = ?", slug).Count(&count)
		if count == 0 {
			return slug
		}
		slug = fmt.Sprintf("%s-%d", base, i)
	}
}
