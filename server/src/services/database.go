package services

import (
	"context"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DatabaseService struct {
	db     *gorm.DB
	isLite bool
}

func NewDatabaseService(dsn string) (*DatabaseService, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return &DatabaseService{db: db}, nil
}

func NewNilDatabaseService() *DatabaseService {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	return &DatabaseService{db: db, isLite: true}
}

func (s *DatabaseService) Gorm() *gorm.DB {
	return s.db
}

func (s *DatabaseService) Ping(ctx context.Context) error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

func (s *DatabaseService) Close() error {
	if s.isLite {
		return nil
	}
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func (s *DatabaseService) Transaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
	return s.db.WithContext(ctx).Transaction(fn)
}

func (s *DatabaseService) AutoMigrate() error {
	if s.isLite {
		return nil
	}
	if err := s.normalizeLegacyAuthSessionSchema(); err != nil {
		return err
	}

	if err := s.db.AutoMigrate(
		&models.User{},
		&models.UserSettings{},
		&models.NotificationPreference{},
		&models.LocalCredential{},
		&models.AuthSession{},
		&models.AuthRefreshToken{},
		&models.EmailVerificationToken{},
		&models.PasswordResetToken{},
		&models.AuthAuditEvent{},
		&models.AuthAccount{},
		&models.Workspace{},
		&models.WorkspaceMember{},
		&models.Anime{},
		&models.Genre{},
		&models.Studio{},
		&models.Character{},
		&models.Episode{},
		&models.MediaAsset{},
		&models.EncodingJob{},
		&models.Review{},
		&models.Comment{},
		&models.Report{},
		&models.Watchlist{},
		&models.WatchlistItem{},
		&models.WatchProgress{},
		&models.WatchHistory{},
		&models.Simulcast{},
		&models.ReleaseSchedule{},
		&models.Notification{},
		&models.SystemSetting{},
		&models.AuditLog{},
		&models.Contact{},
		&models.ContactGroup{},
		&models.SeoMeta{},
		&models.SourceSyncLog{},
		&models.SourceConfig{},
		&models.Category{},
		&models.FAQ{},
		&models.Ticket{},
		&models.TicketReply{},
		&models.ContactMessage{},
		&models.CalendarEvent{},
		&models.Premiere{},
		&models.Integration{},
		&models.ApiKey{},
		&models.DomainConfig{},
		&models.Tag{},
		&models.Collection{},
		&models.CollectionEntry{},
		&models.CollectionSource{},
		&models.Role{},
		&models.UserRole{},
		&models.Profile{},
		&models.MfaRecoveryCode{},
		&models.MfaSecret{},
	); err != nil {
		return err
	}
	if err := s.migrateDuplicateGuardrails(); err != nil {
		return err
	}
	return s.BackfillAnimeSlugs(context.Background())
}

// BackfillAnimeSlugs rewrites machine-generated slugs of already-imported
// catalog rows into human-readable kebab-case slugs derived from their title.
// Provider sync paths used to store the source id (Plex numeric rating keys,
// Jellyfin UUIDs) directly as the slug, which made public URLs look like
// /movies/848238 — this restores readable ones like /movies/the-gorge.
func (s *DatabaseService) BackfillAnimeSlugs(ctx context.Context) error {
	if s.isLite {
		return nil
	}
	// Matches Plex numeric rating keys and Jellyfin UUIDs (case-insensitive).
	const machineSlugPattern = `^([0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$`
	var rows []models.Anime
	if err := s.db.WithContext(ctx).Unscoped().
		Where("slug ~* ?", machineSlugPattern).
		Find(&rows).Error; err != nil {
		return err
	}
	for i := range rows {
		row := &rows[i]
		newSlug := uniqueSlug(ctx, s.db, generateSlug(row.Title))
		if newSlug == row.Slug {
			continue
		}
		if err := s.db.WithContext(ctx).Unscoped().Model(row).Update("slug", newSlug).Error; err != nil {
			return err
		}
	}
	return nil
}

// migrateDuplicateGuardrails adds unique indexes on the provider external IDs
// stored in the anime metadata JSONB so the same series/movie cannot be
// imported twice from the same source. Each index matches either the legacy
// top-level key (anilist_id/mal_id) or the newer external_ids object, and
// ignores soft-deleted rows so an entry can be re-imported after a delete.
func (s *DatabaseService) migrateDuplicateGuardrails() error {
	if s.isLite {
		return nil
	}
	statements := []string{
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_anime_anilist_external_id
		 ON anime ((COALESCE(metadata->>'anilist_id', metadata->'external_ids'->>'anilist')))
		 WHERE deleted_at IS NULL
		   AND COALESCE(metadata->>'anilist_id', metadata->'external_ids'->>'anilist') IS NOT NULL`,
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_anime_mal_external_id
		 ON anime ((COALESCE(metadata->>'mal_id', metadata->'external_ids'->>'mal')))
		 WHERE deleted_at IS NULL
		   AND COALESCE(metadata->>'mal_id', metadata->'external_ids'->>'mal') IS NOT NULL`,
		// One row per provider item: the Plex/Jellyfin syncs already upsert by
		// (source, metadata->>'sourceId'), this index makes the guard atomic so
		// two racing syncs can never insert the same remote item twice.
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_anime_provider_source
		 ON anime (source, (metadata->>'sourceId'))
		 WHERE deleted_at IS NULL
		   AND metadata->>'sourceId' IS NOT NULL
		   AND metadata->>'sourceId' != ''`,
	}
	for _, stmt := range statements {
		if err := s.db.Exec(stmt).Error; err != nil {
			return err
		}
	}
	return nil
}

func (s *DatabaseService) normalizeLegacyAuthSessionSchema() error {
	if s.isLite {
		return nil
	}
	return s.db.Exec(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'auth_sessions'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'refresh_token_family_id'
    ) THEN
      ALTER TABLE auth_sessions ADD COLUMN refresh_token_family_id text;
    END IF;

    UPDATE auth_sessions
    SET refresh_token_family_id = COALESCE(NULLIF(refresh_token_family_id, ''), id)
    WHERE refresh_token_family_id IS NULL OR refresh_token_family_id = '';

    ALTER TABLE auth_sessions
    ALTER COLUMN refresh_token_family_id SET DEFAULT '',
    ALTER COLUMN refresh_token_family_id SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'last_used_at'
    ) THEN
      ALTER TABLE auth_sessions ADD COLUMN last_used_at timestamptz;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'last_active_at'
    ) THEN
      UPDATE auth_sessions
      SET last_used_at = COALESCE(last_used_at, last_active_at, created_at, NOW())
      WHERE last_used_at IS NULL;
    ELSE
      UPDATE auth_sessions
      SET last_used_at = COALESCE(last_used_at, created_at, NOW())
      WHERE last_used_at IS NULL;
    END IF;

    ALTER TABLE auth_sessions
    ALTER COLUMN last_used_at SET DEFAULT NOW(),
    ALTER COLUMN last_used_at SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'workspace_id'
    ) THEN
      ALTER TABLE auth_sessions ADD COLUMN workspace_id text;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'revoked_at'
    ) THEN
      ALTER TABLE auth_sessions ADD COLUMN revoked_at timestamptz;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'revocation_reason'
    ) THEN
      ALTER TABLE auth_sessions ADD COLUMN revocation_reason text;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'auth_sessions' AND column_name = 'refresh_token_hash'
    ) THEN
      UPDATE auth_sessions
      SET refresh_token_hash = COALESCE(refresh_token_hash, token_hash, id)
      WHERE refresh_token_hash IS NULL;
    END IF;
  END IF;
END $$;
`).Error
}
