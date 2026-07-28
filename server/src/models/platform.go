package models

import (
	"time"

	"gorm.io/datatypes"
)

type FileItem struct {
	Common
	UserId      string     `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	WorkspaceId string     `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	ParentId    *string    `gorm:"column:parent_id;type:text" json:"parentId,omitempty"`
	Name        string     `gorm:"column:name;type:text;not null" json:"name"`
	Path        string     `gorm:"column:path;type:text;not null" json:"path"`
	Type        string     `gorm:"column:type;type:text;not null" json:"type"`
	MimeType    *string    `gorm:"column:mime_type;type:text" json:"mimeType,omitempty"`
	Size        int64      `gorm:"column:size;not null" json:"size"`
	Extension   *string    `gorm:"column:extension;type:text" json:"extension,omitempty"`
	Hash        *string    `gorm:"column:hash;type:text" json:"hash,omitempty"`
	Url         *string    `gorm:"column:url;type:text" json:"url,omitempty"`
	ThumbnailUrl *string   `gorm:"column:thumbnail_url;type:text" json:"thumbnailUrl,omitempty"`
	IsFavorite  bool       `gorm:"column:is_favorite;not null;default:false" json:"isFavorite"`
	IsPublic    bool       `gorm:"column:is_public;not null;default:false" json:"isPublic"`
	IsShared    bool       `gorm:"column:is_shared;not null;default:false" json:"isShared"`
	SharedWith  *string    `gorm:"column:shared_with;type:text" json:"sharedWith,omitempty"`
	Permissions *string    `gorm:"column:permissions;type:text" json:"permissions,omitempty"`
	Description *string    `gorm:"column:description;type:text" json:"description,omitempty"`
	Tags        *string    `gorm:"column:tags;type:text" json:"tags,omitempty"`
	UploadStatus *string   `gorm:"column:upload_status;type:text" json:"uploadStatus,omitempty"`
	UploadedBy  *string    `gorm:"column:uploaded_by;type:text" json:"uploadedBy,omitempty"`
	Version     int        `gorm:"column:version;not null;default:1" json:"version"`
}

func (FileItem) TableName() string { return "file_items" }

type BillingInfo struct {
	Common
	UserId          string     `gorm:"column:user_id;type:text;uniqueIndex;not null" json:"userId"`
	CustomerId      *string    `gorm:"column:customer_id;type:text" json:"customerId,omitempty"`
	PaymentMethodId *string    `gorm:"column:payment_method_id;type:text" json:"paymentMethodId,omitempty"`
	PaymentMethod   *string    `gorm:"column:payment_method;type:text" json:"paymentMethod,omitempty"`
	BillingEmail    *string    `gorm:"column:billing_email;type:text" json:"billingEmail,omitempty"`
	BillingAddress  *string    `gorm:"column:billing_address;type:text" json:"billingAddress,omitempty"`
	TaxId           *string    `gorm:"column:tax_id;type:text" json:"taxId,omitempty"`
	Currency        string     `gorm:"column:currency;type:text;not null;default:'EUR'" json:"currency"`
	NextBillingDate  *time.Time `gorm:"column:next_billing_date" json:"nextBillingDate,omitempty"`
	LastPaymentDate  *time.Time `gorm:"column:last_payment_date" json:"lastPaymentDate,omitempty"`
	PaymentStatus   *string    `gorm:"column:payment_status;type:text" json:"paymentStatus,omitempty"`
}

func (BillingInfo) TableName() string { return "billing_info" }

type Subscription struct {
	Common
	UserId         string         `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	PlanId         string         `gorm:"column:plan_id;type:text;not null" json:"planId"`
	PlanName       string         `gorm:"column:plan_name;type:text;not null" json:"planName"`
	Status         string         `gorm:"column:status;type:text;not null;default:'active'" json:"status"`
	Amount         float64        `gorm:"column:amount;not null" json:"amount"`
	Currency       string         `gorm:"column:currency;type:text;not null;default:'EUR'" json:"currency"`
	Interval       string         `gorm:"column:interval;type:text;not null" json:"interval"`
	StartDate      time.Time      `gorm:"column:start_date;not null" json:"startDate"`
	EndDate        *time.Time     `gorm:"column:end_date" json:"endDate,omitempty"`
	CancelAt       *time.Time     `gorm:"column:cancel_at" json:"cancelAt,omitempty"`
	CanceledAt     *time.Time     `gorm:"column:canceled_at" json:"canceledAt,omitempty"`
	TrialStart     *time.Time     `gorm:"column:trial_start" json:"trialStart,omitempty"`
	TrialEnd       *time.Time     `gorm:"column:trial_end" json:"trialEnd,omitempty"`
	Features       *string        `gorm:"column:features;type:text" json:"features,omitempty"`
	Metadata       datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (Subscription) TableName() string { return "subscriptions" }

type Transaction struct {
	Common
	UserId         string  `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	SubscriptionId *string `gorm:"column:subscription_id;type:text" json:"subscriptionId,omitempty"`
	Type           string  `gorm:"column:type;type:text;not null" json:"type"`
	Amount         float64 `gorm:"column:amount;not null" json:"amount"`
	Currency       string  `gorm:"column:currency;type:text;not null;default:'EUR'" json:"currency"`
	Description    *string `gorm:"column:description;type:text" json:"description,omitempty"`
	Status         string  `gorm:"column:status;type:text;not null;default:'completed'" json:"status"`
	Date           time.Time `gorm:"column:date;not null" json:"date"`
	InvoiceId      *string `gorm:"column:invoice_id;type:text" json:"invoiceId,omitempty"`
	InvoiceUrl     *string `gorm:"column:invoice_url;type:text" json:"invoiceUrl,omitempty"`
	PaymentId      *string `gorm:"column:payment_id;type:text" json:"paymentId,omitempty"`
	Gateway        *string `gorm:"column:gateway;type:text" json:"gateway,omitempty"`
	GatewayData    *string `gorm:"column:gateway_data;type:text" json:"gatewayData,omitempty"`
}

func (Transaction) TableName() string { return "transactions" }

type PrivacySettings struct {
	Common
	UserId            string `gorm:"column:user_id;type:text;uniqueIndex;not null" json:"userId"`
	DataProcessing    bool   `gorm:"column:data_processing;not null;default:true" json:"dataProcessing"`
	MarketingEmails   bool   `gorm:"column:marketing_emails;not null;default:true" json:"marketingEmails"`
	Analytics         bool   `gorm:"column:analytics;not null;default:true" json:"analytics"`
	PublicProfile     bool   `gorm:"column:public_profile;not null;default:false" json:"publicProfile"`
	Searchable        bool   `gorm:"column:searchable;not null;default:true" json:"searchable"`
	ShowOnlineStatus  bool   `gorm:"column:show_online_status;not null;default:true" json:"showOnlineStatus"`
	DataRetention     *string `gorm:"column:data_retention;type:text" json:"dataRetention,omitempty"`
}

func (PrivacySettings) TableName() string { return "privacy_settings" }

type Device struct {
	Common
	UserId        string     `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	Type          string     `gorm:"column:type;type:text;not null" json:"type"`
	Os            *string    `gorm:"column:os;type:text" json:"os,omitempty"`
	OsVersion     *string    `gorm:"column:os_version;type:text" json:"osVersion,omitempty"`
	Browser       *string    `gorm:"column:browser;type:text" json:"browser,omitempty"`
	BrowserVersion *string   `gorm:"column:browser_version;type:text" json:"browserVersion,omitempty"`
	DeviceModel   *string    `gorm:"column:device_model;type:text" json:"deviceModel,omitempty"`
	Manufacturer  *string    `gorm:"column:manufacturer;type:text" json:"manufacturer,omitempty"`
	LastActive    time.Time  `gorm:"column:last_active;not null" json:"lastActive"`
	IsTrusted     bool       `gorm:"column:is_trusted;not null;default:false" json:"isTrusted"`
	PushToken     *string    `gorm:"column:push_token;type:text" json:"pushToken,omitempty"`
}

func (Device) TableName() string { return "devices" }

type LoginHistory struct {
	ID            string     `gorm:"type:text;primaryKey" json:"id"`
	CreatedAt     time.Time  `gorm:"not null" json:"createdAt"`
	UserId        string     `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	SessionId     *string    `gorm:"column:session_id;type:text" json:"sessionId,omitempty"`
	Timestamp     time.Time  `gorm:"column:timestamp;not null" json:"timestamp"`
	IpAddress     *string    `gorm:"column:ip_address;type:text" json:"ipAddress,omitempty"`
	Location      *string    `gorm:"column:location;type:text" json:"location,omitempty"`
	Country       *string    `gorm:"column:country;type:text" json:"country,omitempty"`
	City          *string    `gorm:"column:city;type:text" json:"city,omitempty"`
	UserAgent     *string    `gorm:"column:user_agent;type:text" json:"userAgent,omitempty"`
	Status        string     `gorm:"column:status;type:text;not null" json:"status"`
	FailureReason *string    `gorm:"column:failure_reason;type:text" json:"failureReason,omitempty"`
	TwoFaUsed     bool       `gorm:"column:two_fa_used;not null;default:false" json:"twoFaUsed"`
	TwoFaMethod   *string    `gorm:"column:two_fa_method;type:text" json:"twoFaMethod,omitempty"`
}

func (LoginHistory) TableName() string { return "login_history" }

type ActivityItem struct {
	Common
	UserId      string `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	WorkspaceId string `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Type        string `gorm:"column:type;type:text;not null" json:"type"`
	EntityId    *string `gorm:"column:entity_id;type:text" json:"entityId,omitempty"`
	Title       *string `gorm:"column:title;type:text" json:"title,omitempty"`
	Message     *string `gorm:"column:message;type:text" json:"message,omitempty"`
	Icon        *string `gorm:"column:icon;type:text" json:"icon,omitempty"`
	Url         *string `gorm:"column:url;type:text" json:"url,omitempty"`
	IsRead      bool   `gorm:"column:is_read;not null;default:false" json:"isRead"`
}

func (ActivityItem) TableName() string { return "activity_items" }

type AuditLog struct {
	Common
	UserId       string         `gorm:"column:user_id;type:text;index;not null" json:"userId"`
	WorkspaceId  string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Action       string         `gorm:"column:action;type:text;index;not null" json:"action"`
	ResourceType string         `gorm:"column:resource_type;type:text" json:"resourceType"`
	ResourceId   *string        `gorm:"column:resource_id;type:text" json:"resourceId,omitempty"`
	Details      datatypes.JSON `gorm:"column:details;type:jsonb" json:"details,omitempty"`
	IpAddress    *string        `gorm:"column:ip_address;type:text" json:"ipAddress,omitempty"`
	UserAgent    *string        `gorm:"column:user_agent;type:text" json:"userAgent,omitempty"`
}

func (AuditLog) TableName() string { return "audit_logs" }

type Application struct {
	Common
	WorkspaceId string `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Name        string `gorm:"column:name;type:text;not null" json:"name"`
	Description *string `gorm:"column:description;type:text" json:"description,omitempty"`
	Status      string `gorm:"column:status;type:text;not null;default:'active'" json:"status"`
	Secret      string `gorm:"column:secret;type:text" json:"-"`
	RedirectUri *string `gorm:"column:redirect_uri;type:text" json:"redirectUri,omitempty"`
}

func (Application) TableName() string { return "applications" }
