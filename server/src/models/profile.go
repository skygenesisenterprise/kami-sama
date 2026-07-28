package models

import (
	"time"
)

type Profile struct {
	Common
	UserID      string         `gorm:"column:user_id;type:text;index:idx_profiles_user_sort,priority:1;not null" json:"userId"`
	DisplayName string         `gorm:"column:display_name;type:text;not null" json:"displayName"`
	AvatarURL   *string        `gorm:"column:avatar_url;type:text" json:"avatarUrl,omitempty"`
	PinCode     *string        `gorm:"column:pin_code;type:text" json:"-"`
	PinEnabled  bool           `gorm:"column:pin_enabled;default:false" json:"pinEnabled"`
	IsDefault   bool           `gorm:"column:is_default;default:false;index:idx_profiles_user_default,priority:2" json:"isDefault"`
	SortOrder   int            `gorm:"column:sort_order;default:0;index:idx_profiles_user_sort,priority:2" json:"sortOrder"`
	LastUsedAt  *time.Time `gorm:"column:last_used_at" json:"lastUsedAt,omitempty"`
}

func (Profile) TableName() string {
	return "profiles"
}
