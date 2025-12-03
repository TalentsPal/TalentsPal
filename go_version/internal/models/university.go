package models

import "go.mongodb.org/mongo-driver/bson/primitive"

const UNIVERSITIES_COLLECTION = "universities"

type University struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name,omitempty"`
	Country   string             `bson:"country,omitempty"`
	City      string             `bson:"city,omitempty"`
	IsActive  bool               `bson:"isActive,omitempty"`
	CreatedAt primitive.DateTime `bson:"createdAt,omitempty"`
	UpdatedAt primitive.DateTime `bson:"updatedAt,omitempty"`
	Version   int32              `bson:"__v,omitempty"`
}
