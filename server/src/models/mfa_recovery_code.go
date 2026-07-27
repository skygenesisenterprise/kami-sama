package models

type MfaRecoveryCode struct {
	Common
	UserID     string `gorm:"column:user_id;type:text;not null;index" json:"userId"`
	CodeHash   string `gorm:"column:code_hash;type:text;not null" json:"-"`
	UsedAt     *string `gorm:"column:used_at;type:text" json:"-"`
	Used       bool   `gorm:"column:used;not null;default:false" json:"used"`
}

func (MfaRecoveryCode) TableName() string {
	return "mfa_recovery_codes"
}
